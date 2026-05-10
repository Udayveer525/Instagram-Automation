import asyncio
import edge_tts
import json
import sys
import os
import re
import struct
import subprocess

VOICE = "en-US-AndrewNeural"

# ─── Per-scene audio generation ───────────────────────────────────────────────


async def generate_scene_audio(
    text: str, output_path: str, srt_path: str, max_retries=3
) -> float:
    """
    Generate MP3, SRT, and word-level timing JSON for a single scene narration.
    The .words.json file gives Captions.tsx exact per-word timestamps.
    """
    for attempt in range(max_retries):
        try:
            communicate = edge_tts.Communicate(text=text, voice=VOICE, rate="+8%")
            submaker = edge_tts.SubMaker()
            word_timings = []  # [{word, start, end}] in seconds

            max_boundary_end_seconds = 0.0
            with open(output_path, "wb") as f:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        submaker.feed(chunk)
                        # Edge TTS gives offsets in 100-nanosecond ticks
                        start_s = round(chunk["offset"] / 10_000_000, 4)
                        end_s   = round((chunk["offset"] + chunk["duration"]) / 10_000_000, 4)
                        word_timings.append({
                            "word":  chunk["text"],
                            "start": start_s,
                            "end":   end_s,
                        })
                        if end_s > max_boundary_end_seconds:
                            max_boundary_end_seconds = end_s
                    elif chunk["type"] == "SentenceBoundary":
                        submaker.feed(chunk)

            # Save SRT
            with open(srt_path, "w", encoding="utf-8") as sub_file:
                sub_file.write(submaker.get_srt())

            # Save word timings JSON alongside the SRT
            words_path = srt_path.replace(".srt", ".words.json")
            with open(words_path, "w", encoding="utf-8") as wf:
                json.dump(word_timings, wf, ensure_ascii=False)

            parsed_duration = get_mp3_duration(output_path)
            # Prefer WordBoundary timing (speech engine's own timeline) when available.
            # It's always more accurate than frame-counting the MP3.
            # Add 0.3s to boundary timing to capture trailing audio after last word.
            if max_boundary_end_seconds > 0:
                return round(max_boundary_end_seconds + 0.3, 3)
            return parsed_duration

        except Exception as e:
            print(
                f"      [!] TTS network glitch on attempt {attempt + 1}/{max_retries}: {str(e)}"
            )
            if attempt == max_retries - 1:
                print("      [!] Out of retries. Crashing pipeline.")
                raise

            await asyncio.sleep(2)


# ─── MP3 duration ─────────────────────────────────────────────────────────────


def get_mp3_duration(filepath: str) -> float:
    frame_count = 0
    sample_rate = 44100
    samples_per_frame = 1152
    try:
        with open(filepath, "rb") as f:
            data = f.read()
        i = 0
        while i < len(data) - 4:
            if data[i] == 0xFF and (data[i + 1] & 0xE0) == 0xE0:
                header = struct.unpack(">I", data[i : i + 4])[0]
                bi = (header >> 12) & 0xF
                si = (header >> 10) & 0x3
                pad = (header >> 9) & 0x1
                bitrates = [
                    0,
                    32,
                    40,
                    48,
                    56,
                    64,
                    80,
                    96,
                    112,
                    128,
                    160,
                    192,
                    224,
                    256,
                    320,
                    0,
                ]
                srs = [44100, 48000, 32000, 0]
                br = bitrates[bi] * 1000
                sr = srs[si]
                if br > 0 and sr > 0:
                    sample_rate = sr
                    frame_count += 1
                    i += (144 * br // sr) + pad
                    continue
            i += 1
    except Exception as e:
        print(f"  Warning: MP3 parse error: {e}", file=sys.stderr)
    if frame_count > 0:
        return round((frame_count * samples_per_frame) / sample_rate, 3)
    return 3.0


# ─── Main ─────────────────────────────────────────────────────────────────────


def main():
    if len(sys.argv) < 2:
        print("Usage: python prepare_reel.py <props.json>")
        sys.exit(1)

    props_path = sys.argv[1]
    with open(props_path, "r", encoding="utf-8") as f:
        props = json.load(f)

    topic = props.get("topic", "reel")
    safe_topic = re.sub(r"[^a-z0-9]+", "_", topic.lower()).strip("_")
    scenes = props.get("scenes", [])

    if not scenes:
        print("ERROR: no scenes in props JSON")
        sys.exit(1)

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    audio_dir = os.path.join(project_root, "public", "audio")
    os.makedirs(audio_dir, exist_ok=True)

    print(f"\nPreparing reel: {topic}")
    print(f"Scenes: {len(scenes)}\n")

    total_duration = 0.0
    scenes_without_narration = []

    for i, scene in enumerate(scenes):
        narration = scene.get("narration", "").strip()
        scene_type = scene.get("type", "unknown")

        if not narration:
            scenes_without_narration.append(i)
            duration = scene.get("durationInSeconds", 4.0)
            scenes[i] = {**scene, "audioFile": None}
            print(f"  Scene {i} ({scene_type}): no narration -> keeping {duration}s")
            total_duration += duration
            continue

        file_name = f"scene_{i}.mp3"
        srt_name = f"scene_{i}.srt"
        audio_path = os.path.join(audio_dir, file_name)
        srt_path = os.path.join(audio_dir, srt_name)
        print(f"  Scene {i} ({scene_type}): generating audio...")
        print(f"    \"{narration[:70]}{'...' if len(narration) > 70 else ''}\"")

        # Generate audio and measure real duration
        actual_duration = asyncio.run(
            generate_scene_audio(narration, audio_path, srt_path)
        )

        # Add tail padding so scene doesn't cut the end of narration.
        padded_duration = round(actual_duration + 1.5, 2)

        scenes[i] = {
            **scene,
            "durationInSeconds": padded_duration,
            "audioFile": f"audio/{file_name}",
            "subtitleFile": f"audio/{srt_name}",
        }
        total_duration += padded_duration

        print(
            f"    OK {actual_duration:.2f}s audio -> {padded_duration}s scene duration"
        )

    if scenes_without_narration:
        print(
            f"\n  Note: scenes {scenes_without_narration} have no narration (silence)."
        )

    # Write updated props
    props["scenes"] = scenes
    # Remove old flat fields if present
    props.pop("narrationScript", None)
    props.pop("sentenceMap", None)
    props.pop("voiceoverFile", None)

    output_path = props_path.replace(".json", "_ready.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(props, f, indent=2)

    print(f"\nOK Total reel duration: {total_duration:.2f}s")
    print(f"OK Ready props: {output_path}")
    print(f"\nRender:")
    print(
        f"  npx remotion render DevDecodedReel out/{safe_topic}.mp4 --props={output_path}"
    )


if __name__ == "__main__":
    main()