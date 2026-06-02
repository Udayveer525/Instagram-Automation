# Instagram Automation

An automated Instagram reel generator built with [Remotion](https://www.remotion.dev/), a small Express webhook server, and a Python preprocessing step that generates narration audio and subtitles before rendering the final video.

This repository currently renders **vertical 1080×1920 reels at 30 fps** and is structured around **scene-based storytelling**: the payload describes a list of scenes, and each scene can render as text, a network diagram, a layered stack, code reveal, stat reveal, or comparison layout.

## What this project does

* Accepts a JSON payload describing a reel.
* Generates narration audio and subtitles with Microsoft Edge TTS.
* Measures audio duration and pads scenes so narration does not get cut off.
* Renders a finished MP4 with Remotion.
* Can run locally through a small webhook server.
* Can run in GitHub Actions and optionally publish a reel through Supabase + Instagram Graph API.

## How the pipeline works

1. A payload is created manually or sent from an external automation tool.
2. The payload is written to `props/incoming.json`.
3. `scripts/prepare_reel.py` generates per-scene MP3 audio and SRT subtitles in `public/audio/`.
4. The script writes an updated payload to `props/incoming_ready.json`.
5. Remotion renders `DevDecodedReel` into `out/latest_reel.mp4`.
6. In the GitHub Actions flow, the final MP4 is uploaded as an artifact and can then be published.

## Features

* **Scene-driven reel generation** with flexible content types.
* **Word-level narration subtitle support** generated alongside audio.
* **Adaptive timing** so scene lengths track actual narration duration.
* **Animated visual system** with reusable hooks and components.
* **Instagram-friendly output**: 1080×1920 portrait format.
* **Two execution paths**:

  * local webhook/server rendering
  * GitHub Actions rendering and publishing

## Repository structure

```text
.
├── .github/workflows/render_reel.yml
├── props/
│   ├── dns.json
│   ├── dns_ready.json
│   ├── incoming.json
│   └── incoming_ready.json
├── public/
│   └── audio/
├── scripts/
│   ├── generate_voice.py
│   ├── measure_audio.py
│   ├── prepare_reel.py
│   └── publish.js
├── src/
│   ├── components/
│   ├── hooks/
│   ├── scenes/
│   ├── Reel.tsx
│   ├── Root.tsx
│   ├── index.ts
│   ├── theme.ts
│   └── types.ts
├── server.js
├── remotion.config.ts
└── package.json
```

## Supported scene types

The current codebase supports these scene types:

* `text_only`
* `network_diagram`
* `layer_stack`
* `code_reveal`
* `stat_reveal`
* `comparison`

Each scene can include:

* `durationInSeconds`
* `narration`
* `audioFile`
* `subtitleFile`

Some scene types have extra fields, such as nodes/arrows for diagrams or left/right columns for comparisons.

## Requirements

* Node.js 22 or newer
* npm
* Python 3.12 or compatible
* FFmpeg
* Internet access for Edge TTS generation

## Installation

```bash
npm install
pip install edge-tts
```

If you are running the webhook server locally, make sure Python can be called as `python` from the same environment where Node runs.

## Local development

Start the Remotion studio:

```bash
npm run dev
```

Or:

```bash
npm start
```

Both commands open Remotion Studio for previewing the composition.

## Rendering a reel locally

The project’s current render flow expects a props JSON file. A ready-to-render file should contain scenes with durations and, optionally, narration.

```bash
python scripts/prepare_reel.py props/incoming.json
npx remotion render DevDecodedReel out/latest_reel.mp4 --props=props/incoming_ready.json
```

There is also an npm script configured for the DNS example payload:

```bash
npm run build
npm run render
```

Both of these use `props/dns_ready.json`.

## Local webhook server

`server.js` exposes a `/webhook` endpoint that accepts a JSON payload, writes it to `props/incoming.json`, then runs the preprocessing and render steps.

Run it with:

```bash
node server.js
```

The server listens on port `3000`.

### Expected webhook payload

At minimum, the payload should include:

```json
{
  "topic": "Your topic here",
  "scenes": [
    {
      "type": "text_only",
      "text": "Hook line",
      "subtext": "Supporting line",
      "style": "hook",
      "durationInSeconds": 5,
      "narration": "Narration for the scene"
    }
  ]
}
```

The sample payload in the repo shows a more complete structure with animated diagrams, narration, and captions.

## Scene data notes

### Text scenes

`text_only` scenes are designed for short hook, CTA, and transition-style copy. The renderer animates words in sequence and changes emphasis based on the `style` field.

### Network diagrams

`network_diagram` scenes use node and arrow data. The current implementation animates nodes and scales arrow timing to fit the scene duration.

### Voice and subtitles

`prepare_reel.py` uses `edge_tts` to generate audio and subtitles. It also pads each narrated scene slightly so the spoken line is not clipped at the end.

## GitHub Actions automation

The workflow at `.github/workflows/render_reel.yml` is triggered by a `repository_dispatch` event named `render_reel`.

It performs the following steps:

* checks out the repository
* installs Node.js 22
* installs Python 3.12
* installs FFmpeg
* installs `edge-tts`
* runs `npm ci`
* writes the incoming payload to `props/incoming.json`
* generates audio and subtitles
* renders `out/latest_reel.mp4`
* uploads the MP4 as an artifact
* optionally publishes to Instagram using secrets

## Publishing to Instagram

The publish script uploads the rendered MP4 to Supabase storage, gets a public URL, creates an Instagram reel container, waits for processing, then publishes the reel.

To use that path, the workflow expects these secrets:

```text
SUPABASE_URL
SUPABASE_SERVICE_KEY
IG_ACCESS_TOKEN
IG_ACCOUNT_ID
```

## Useful scripts

```bash
npm run dev      # Remotion Studio
npm start        # Remotion Studio
npm run build    # Render the DNS example to out/reel.mp4
npm run render   # Render using the DNS example props
npm run upgrade  # Upgrade Remotion packages
npm run lint     # ESLint + TypeScript checks
```

Additional Python utilities:

```bash
python scripts/generate_voice.py "Script text" output.mp3 andrew
python scripts/measure_audio.py public/audio/scene_0.mp3
```

## Key implementation details

* The composition is registered as `DevDecodedReel`.
* The reel runs at **30 fps** and uses **1080×1920** output.
* Scene duration is computed from the ready props at render time.
* The visual theme is centralized in `src/theme.ts`.
* Reusable animation helpers live in `src/hooks/useAnimatedValue.ts`.

## Troubleshooting

* If rendering fails, confirm FFmpeg is installed.
* If narration is missing, verify `edge-tts` can access the network.
* If subtitles are missing, check that the scene includes `narration`.
* If the render crashes on empty input, make sure `props/incoming.json` contains a non-empty `scenes` array.
* If Instagram publishing fails, check the Supabase and Instagram secrets first.

## License

This repository is currently marked as unlicensed in `package.json`.

## Example payload

The repository includes `props/dns_ready.json` as a complete example. It demonstrates a reel about how DNS works, with a hook, a network diagram, a stat reveal, and a CTA scene.

---

If you want this, the next useful step is usually to adapt the README to your preferred audience: developer-focused, automation-focused, or Instagram-content-focused.
