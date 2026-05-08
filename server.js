const express = require('express');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json()); // Parse incoming JSON payloads

app.post('/webhook', (req, res) => {
  try {
    const payload = req.body;
    console.log(`\n========================================`);
    console.log(`🎬 NEW VIDEO JOB RECEIVED: ${payload.topic}`);
    console.log(`========================================`);

    // 1. Tell n8n "I got it!" immediately so the workflow doesn't timeout
    res.status(200).send({ message: "Job received! Starting render pipeline..." });

    // 2. Save the JSON from n8n into your props folder
    const propsPath = path.join(__dirname, 'props', 'incoming.json');
    fs.writeFileSync(propsPath, JSON.stringify(payload, null, 2));

    // 3. Run the pipeline in the background
    setTimeout(() => {
      try {
        console.log("\n🎧 1/2: Running Python Voiceover & Subtitle Engine...");
        // This generates the audio, washes it through FFmpeg, and creates incoming_ready.json
        execSync(`python scripts/prepare_reel.py props/incoming.json`, { stdio: 'inherit' });

        console.log("\n🎥 2/2: Running Remotion Render Engine...");
        // This reads the newly created incoming_ready.json and renders the MP4
        execSync(`npx remotion render DevDecodedReel out/latest_reel.mp4 --props=props/incoming_ready.json`, { stdio: 'inherit' });

        console.log(`\n✅ PIPELINE COMPLETE! Your video is ready at: out/latest_reel.mp4`);
      } catch (err) {
        console.error("\n❌ Pipeline crashed during execution:", err.message);
      }
    }, 1000);

  } catch (error) {
    console.error("Server error:", error);
  }
});

app.listen(3000, () => {
  console.log('🚀 Local Render Server listening on port 3000');
  console.log('Waiting for n8n webhooks...');
});