const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ─── Secrets ───────────────────────────────────────────────────────────────────
const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_SERVICE_KEY;
const igToken      = process.env.IG_ACCESS_TOKEN;
const igAccountId  = process.env.IG_ACCOUNT_ID;

console.log(`\nDEBUG: Token exists? ${!!igToken} | Length: ${igToken ? igToken.length : 'UNDEFINED'}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry + exponential backoff.
 * Retries on network errors (fetch failed, ECONNRESET etc).
 * Does NOT retry on HTTP 4xx/5xx — those are real errors.
 */
async function fetchWithRetry(url, options = {}, maxRetries = 4) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res; // Return on any HTTP response (caller checks status)
    } catch (err) {
      lastError = err;
      const waitMs = Math.min(1000 * Math.pow(2, attempt - 1), 16000); // 1s, 2s, 4s, 8s
      console.log(`   [retry ${attempt}/${maxRetries}] Network error: ${err.message} — waiting ${waitMs}ms`);
      if (attempt < maxRetries) await sleep(waitMs);
    }
  }
  throw lastError;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function publishReel() {
  try {
    // ── Phase 1: Upload to Supabase ──────────────────────────────────────────
    console.log('\n🚀 Phase 1: Uploading to Supabase...');

    const videoPath  = path.join(__dirname, '../out/latest_reel.mp4');
    const jsonPath   = path.join(__dirname, '../props/incoming.json');

    const videoBuffer = fs.readFileSync(videoPath);
    const scriptData  = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const fileName    = `reel_${Date.now()}.mp4`;

    const { data, error } = await supabase.storage
      .from('reels')
      .upload(fileName, videoBuffer, { contentType: 'video/mp4' });

    if (error) throw new Error(`Supabase Upload Failed: ${error.message}`);

    const { data: publicData } = supabase.storage.from('reels').getPublicUrl(fileName);
    const videoUrl = publicData.publicUrl;
    console.log(`✅ Uploaded! Public URL: ${videoUrl}`);

    // ── Phase 2: Create Instagram container ─────────────────────────────────
    console.log('\n🚀 Phase 2: Telling Instagram to download the video...');

    const caption = scriptData.caption
      || `🧠 ${scriptData.topic}\n\nFollow @Dev_De.coded for more tech deep-dives.\n\n#coding #softwareengineer #tech`;

    const containerUrl = `https://graph.instagram.com/v25.0/${igAccountId}/media?access_token=${igToken}`;

    const containerRes = await fetchWithRetry(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_type: 'REELS', video_url: videoUrl, caption }),
    });

    const containerData = await containerRes.json();
    if (containerData.error) throw new Error(`IG Container Error: ${JSON.stringify(containerData.error)}`);

    const creationId = containerData.id;
    console.log(`✅ Container created! ID: ${creationId}`);

    // ── Phase 3: Poll until FINISHED ────────────────────────────────────────
    console.log('\n⏳ Phase 3: Waiting for Instagram to process the video...');

    const MAX_POLLS   = 24;   // 24 × 10s = 4 minutes max
    const POLL_INTERVAL = 10_000;
    let status = 'IN_PROGRESS';
    let polls  = 0;

    while (status !== 'FINISHED') {
      if (polls >= MAX_POLLS) {
        throw new Error(`Instagram processing timed out after ${MAX_POLLS * POLL_INTERVAL / 1000}s`);
      }

      await sleep(POLL_INTERVAL);
      polls++;

      const statusUrl = `https://graph.instagram.com/v25.0/${creationId}?fields=status_code&access_token=${igToken}`;
      const statusRes = await fetchWithRetry(statusUrl, {}, 4);
      const statusData = await statusRes.json();

      if (statusData.error) throw new Error(`IG Status Error: ${JSON.stringify(statusData.error)}`);

      status = statusData.status_code;
      console.log(`   [${polls}/${MAX_POLLS}] Status: ${status}...`);

      if (status === 'ERROR') throw new Error('Instagram failed to process the video. Check the video format/codec.');
    }

    // ── Phase 4: Publish ─────────────────────────────────────────────────────
    console.log('\n🚀 Phase 4: Publishing to the timeline!');

    const publishUrl = `https://graph.instagram.com/v25.0/${igAccountId}/media_publish?access_token=${igToken}`;

    const publishRes = await fetchWithRetry(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: creationId }),
    });

    const publishData = await publishRes.json();
    if (publishData.error) throw new Error(`IG Publish Error: ${JSON.stringify(publishData.error)}`);

    console.log(`\n🎉 Reel Published! IG Post ID: ${publishData.id}`);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    await supabase.storage.from('reels').remove([fileName]);
    console.log('🧹 Cleaned up Supabase storage.');

  } catch (err) {
    console.error(`\n❌ Pipeline crashed: ${err.message}`);
    process.exit(1);
  }
}

publishReel();