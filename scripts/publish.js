const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Secrets
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const igToken = process.env.IG_ACCESS_TOKEN;
const igAccountId = process.env.IG_ACCOUNT_ID;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function publishReel() {
  try {
    console.log('\n🚀 Phase 1: Uploading to Supabase...');
    
    // Read the MP4 and the incoming JSON (for the caption)
    const videoPath = path.join(__dirname, '../out/latest_reel.mp4');
    const jsonPath = path.join(__dirname, '../props/incoming.json');
    
    const videoBuffer = fs.readFileSync(videoPath);
    const scriptData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    // Create a unique filename
    const fileName = `reel_${Date.now()}.mp4`;

    // Upload to the 'reels' bucket
    const { data, error } = await supabase.storage
      .from('reels')
      .upload(fileName, videoBuffer, { contentType: 'video/mp4' });

    if (error) throw new Error(`Supabase Upload Failed: ${error.message}`);

    // Get the Public URL
    const { data: publicData } = supabase.storage.from('reels').getPublicUrl(fileName);
    const videoUrl = publicData.publicUrl;
    console.log(`✅ Uploaded! Public URL: ${videoUrl}`);

    console.log('\n🚀 Phase 2: Telling Instagram to download the video...');
    
    // Generate a caption from the topic
    const caption = `🧠 ${scriptData.topic}\n\nFollow @Dev_De.coded for more tech deep-dives.\n\n#coding #softwareengineer #tech #developer #computerscience`;

    const createContainerUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media`;
    const containerRes = await fetch(createContainerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
        access_token: igToken
      })
    });
    
    const containerData = await containerRes.json();
    if (containerData.error) throw new Error(`IG Container Error: ${JSON.stringify(containerData.error)}`);
    
    const creationId = containerData.id;
    console.log(`✅ Container created! ID: ${creationId}`);

    console.log('\n⏳ Phase 3: Waiting for Instagram to process the video (this takes ~30s)...');
    
    let status = 'IN_PROGRESS';
    while (status !== 'FINISHED') {
      await sleep(5000); // Wait 5 seconds between checks
      
      const statusUrl = `https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${igToken}`;
      const statusRes = await fetch(statusUrl);
      const statusData = await statusRes.json();
      
      status = statusData.status_code;
      console.log(`   Status: ${status}...`);
      
      if (status === 'ERROR') throw new Error('Instagram failed to process the video.');
    }

    console.log('\n🚀 Phase 4: Publishing to the timeline!');
    const publishUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: igToken
      })
    });

    const publishData = await publishRes.json();
    if (publishData.error) throw new Error(`IG Publish Error: ${JSON.stringify(publishData.error)}`);

    console.log(`\n🎉 BOOM! Reel Published Successfully! IG Post ID: ${publishData.id}`);

    // Optional: Clean up the Supabase bucket so you don't waste storage
    await supabase.storage.from('reels').remove([fileName]);
    console.log('🧹 Cleaned up Supabase storage.');

  } catch (error) {
    console.error(`\n❌ Pipeline crashed: ${error.message}`);
    process.exit(1);
  }
}

publishReel();