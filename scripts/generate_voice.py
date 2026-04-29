import asyncio
import edge_tts
import json
import sys
import os

VOICE = "en-US-AndrewNeural"

VOICE_OPTIONS = {
    "andrew":  "en-US-AndrewNeural",
    "brian":   "en-US-BrianNeural",
    "emma":    "en-US-EmmaNeural",
    "jenny":   "en-US-JennyNeural",
    "guy":     "en-US-GuyNeural",
    "aria":    "en-US-AriaNeural",
}

async def generate(script: str, output_path: str, voice: str = VOICE):
    communicate = edge_tts.Communicate(
        text=script,
        voice=voice,
        rate="+8%",
        volume="+0%",
        pitch="+0Hz",
    )
    await communicate.save(output_path)

async def generate_with_subtitles(script: str, output_path: str, subtitle_path: str, voice: str = VOICE):
    communicate = edge_tts.Communicate(
        text=script,
        voice=voice,
        rate="+8%",
    )
    submaker = edge_tts.SubMaker()
    with open(output_path, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.create_sub(chunk["offset"], chunk["duration"], chunk["text"])

    with open(subtitle_path, "w", encoding="utf-8") as sub_file:
        sub_file.write(submaker.generate_subs())

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_voice.py <script_text> <output_filename> [voice_name]")
        sys.exit(1)

    script = sys.argv[1]
    output_filename = sys.argv[2]
    voice_key = sys.argv[3] if len(sys.argv) > 3 else "andrew"
    voice = VOICE_OPTIONS.get(voice_key, VOICE)

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    audio_dir = os.path.join(project_root, "public", "audio")
    os.makedirs(audio_dir, exist_ok=True)

    audio_path = os.path.join(audio_dir, output_filename)
    subtitle_path = os.path.join(audio_dir, output_filename.replace(".mp3", ".srt"))

    print(f"Generating voice: {voice}")
    print(f"Output: {audio_path}")

    asyncio.run(generate_with_subtitles(script, audio_path, subtitle_path, voice))

    print(f"SUCCESS:{output_filename}")
    print(f"SUBTITLES:{subtitle_path}")

if __name__ == "__main__":
    main()