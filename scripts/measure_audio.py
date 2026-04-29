import sys
import json
import wave
import contextlib
import struct
import os

def get_mp3_duration(filepath: str) -> float:
    """
    Estimate MP3 duration by reading frame headers.
    Returns duration in seconds.
    """
    try:
        with open(filepath, 'rb') as f:
            data = f.read()

        frame_count = 0
        i = 0
        sample_rate = 44100
        samples_per_frame = 1152

        while i < len(data) - 4:
            if data[i] == 0xFF and (data[i+1] & 0xE0) == 0xE0:
                header = struct.unpack('>I', data[i:i+4])[0]
                bitrate_index = (header >> 12) & 0xF
                sr_index = (header >> 10) & 0x3
                padding = (header >> 9) & 0x1

                bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
                sample_rates = [44100, 48000, 32000, 0]

                bitrate = bitrates[bitrate_index] * 1000
                sample_rate = sample_rates[sr_index]

                if bitrate > 0 and sample_rate > 0:
                    frame_size = (144 * bitrate // sample_rate) + padding
                    frame_count += 1
                    i += frame_size
                    continue
            i += 1

        if frame_count > 0 and sample_rate > 0:
            duration = (frame_count * samples_per_frame) / sample_rate
            return duration

    except Exception as e:
        print(f"Warning: could not parse MP3 precisely: {e}", file=sys.stderr)

    return 0.0

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "no file provided"}))
        sys.exit(1)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(json.dumps({"error": f"file not found: {filepath}"}))
        sys.exit(1)

    duration = get_mp3_duration(filepath)
    print(json.dumps({"duration": round(duration, 3), "filepath": filepath}))

if __name__ == "__main__":
    main()