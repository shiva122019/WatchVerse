require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const songs = [
  {
    name: "aarzu",
    file: "C:\\Users\\Shriyanshi\\Downloads\\Telegram Desktop\\Aarzu - Instrumental.mp3",
  },
  {
    name: "bairan",
    file: "C:\\Users\\Shriyanshi\\Downloads\\Telegram Desktop\\Bairan - Banjaare (Karaoke with Lyrics).mp3",
  },
  {
    name: "apna_bana_le",
    file: "C:\\Users\\Shriyanshi\\Downloads\\Telegram Desktop\\Apna_Bana_Le_Arijit_Singh_Karaoke_With_Scrolling_Lyrics_Eng_हिंदी.mp3",
  },
  {
    name: "tujhe_kitna_chahne_lage",
    file: "C:\\Users\\Shriyanshi\\Downloads\\Telegram Desktop\\Apna_Bana_Le_Arijit_Singh_Karaoke_With_Scrolling_Lyrics_Eng_हिंदी.mp3",
  },
  {
    name: "arz_kiya_hai",
    file: "C:\\Users\\Shriyanshi\\Downloads\\Telegram Desktop\\Arz Kiya Hai - Coke Studio Bharat (Karaoke Version).mp3",
  },
  {
    name: "memories",
    file: "C:\\Users\\Shriyanshi\\Downloads\\Telegram Desktop\\Maroon 5 - Memories (Karaoke Version).mp3",
  },
];

async function uploadAll() {
  const results = {};

  for (const song of songs) {
    try {
      console.log(`\n⏫ Uploading "${song.name}"...`);
      const result = await cloudinary.uploader.upload(song.file, {
        resource_type: "video",
        folder: "karaoke_tracks",
        public_id: song.name,
        overwrite: true,
        format: "mp3",
      });
      results[song.name] = result.secure_url;
      console.log(`✅ Done: ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ Failed to upload "${song.name}":`, err.message);
      results[song.name] = null;
    }
  }

  console.log("\n\n========= FINAL RESULTS =========");
  console.log(JSON.stringify(results, null, 2));
}

uploadAll();
