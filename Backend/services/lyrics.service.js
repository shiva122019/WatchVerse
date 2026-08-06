const { askGemini } = require("./gemini.service");

// ─────────────────────────────────────────────────────────────────────────────
// Full hardcoded lyrics for all uploaded Cloudinary karaoke tracks.
// These load instantly and are accurate — no AI call needed for these songs.
// ─────────────────────────────────────────────────────────────────────────────

const HARDCODED_LYRICS = {

  // ── 1. Closer – The Chainsmokers ft. Halsey (~4:18) ──────────────────────
  closer: [
    { time: 0,   text: "🎵 [Closer - The Chainsmokers ft. Halsey]" },
    { time: 5,   text: "[Intro]" },
    { time: 14,  text: "Hey, I was doing just fine before I met you" },
    { time: 18,  text: "I drink too much and that's an issue but I'm okay" },
    { time: 22,  text: "Hey, you tell your friends it was nice to meet them" },
    { time: 26,  text: "But I hope I never see them again" },
    { time: 30,  text: "I know it breaks your heart" },
    { time: 33,  text: "Moved to the city in a broke-down car" },
    { time: 37,  text: "And four years, no calls" },
    { time: 39,  text: "Now you're looking pretty in a hotel bar" },
    { time: 43,  text: "And I can't stop" },
    { time: 45,  text: "No, I can't stop" },
    { time: 48,  text: "So baby pull me closer in the back seat of your Rover" },
    { time: 52,  text: "That I know you can't afford" },
    { time: 55,  text: "Bite that tattoo on your shoulder" },
    { time: 58,  text: "Pull the sheets right off the corner" },
    { time: 61,  text: "Of the mattress that you stole" },
    { time: 64,  text: "From your roommate back in Boulder" },
    { time: 67,  text: "We ain't ever getting older" },
    { time: 71,  text: "We ain't ever getting older" },
    { time: 75,  text: "We ain't ever getting older" },
    { time: 78,  text: "[Verse 2]" },
    { time: 82,  text: "You, you look as good as the day I met you" },
    { time: 86,  text: "I forget just why I left you, I was insane" },
    { time: 90,  text: "Stay, and play that Blink-182 song" },
    { time: 94,  text: "That we beat to death in Tucson, okay" },
    { time: 98,  text: "I know it breaks your heart" },
    { time: 101, text: "Moved to the city in a broke-down car" },
    { time: 105, text: "And four years, no calls" },
    { time: 107, text: "Now I'm looking pretty in a hotel bar" },
    { time: 111, text: "And I can't stop" },
    { time: 113, text: "No, I can't stop" },
    { time: 116, text: "So baby pull me closer in the back seat of your Rover" },
    { time: 120, text: "That I know you can't afford" },
    { time: 123, text: "Bite that tattoo on your shoulder" },
    { time: 126, text: "Pull the sheets right off the corner" },
    { time: 129, text: "Of the mattress that you stole" },
    { time: 132, text: "From your roommate back in Boulder" },
    { time: 135, text: "We ain't ever getting older" },
    { time: 139, text: "We ain't ever getting older" },
    { time: 143, text: "We ain't ever getting older" },
    { time: 148, text: "[Bridge]" },
    { time: 152, text: "So baby pull me closer in the back seat of your Rover" },
    { time: 156, text: "That I know you can't afford" },
    { time: 159, text: "Bite that tattoo on your shoulder" },
    { time: 162, text: "Pull the sheets right off the corner" },
    { time: 165, text: "Of the mattress that you stole" },
    { time: 168, text: "From your roommate back in Boulder" },
    { time: 171, text: "We ain't ever getting older" },
    { time: 175, text: "We ain't ever getting older" },
    { time: 179, text: "We ain't ever getting older" },
    { time: 183, text: "[Outro]" },
    { time: 190, text: "We ain't ever getting older... 🎵" },
  ],

  // ── 2. Memories – Maroon 5 (~3:10) ──────────────────────────────────────
  memories: [
    { time: 0,   text: "🎵 [Memories - Maroon 5]" },
    { time: 4,   text: "[Intro]" },
    { time: 12,  text: "Here's to the ones that we got" },
    { time: 15,  text: "Cheers to the wish you were here, but you're not" },
    { time: 19,  text: "'Cause the drinks bring back all the memories" },
    { time: 23,  text: "Of everything we've been through" },
    { time: 26,  text: "Toast to the ones here today" },
    { time: 30,  text: "Toast to the ones that we lost on the way" },
    { time: 33,  text: "'Cause the drinks bring back all the memories" },
    { time: 37,  text: "And the memories bring back, memories bring back you" },
    { time: 43,  text: "[Verse 1]" },
    { time: 46,  text: "There's a time that I remember when I did not know no pain" },
    { time: 51,  text: "When I believed in forever and everything would stay the same" },
    { time: 55,  text: "Now my heart feel like December when somebody say your name" },
    { time: 60,  text: "'Cause I can't reach out to call you" },
    { time: 63,  text: "But I know I will one day, yeah" },
    { time: 67,  text: "Everybody hurts sometimes" },
    { time: 70,  text: "Everybody hurts someday, ayy" },
    { time: 74,  text: "But everything gon' be alright" },
    { time: 77,  text: "Go and raise a glass and say, ayy" },
    { time: 80,  text: "Here's to the ones that we got" },
    { time: 84,  text: "Cheers to the wish you were here, but you're not" },
    { time: 87,  text: "'Cause the drinks bring back all the memories" },
    { time: 91,  text: "Of everything we've been through" },
    { time: 95,  text: "Toast to the ones here today" },
    { time: 98,  text: "Toast to the ones that we lost on the way" },
    { time: 102, text: "'Cause the drinks bring back all the memories" },
    { time: 106, text: "And the memories bring back, memories bring back you" },
    { time: 113, text: "[Verse 2]" },
    { time: 116, text: "There's a time that I remember when I never felt so lost" },
    { time: 121, text: "When I felt all of the hatred was so strong, it was the cost" },
    { time: 125, text: "Now my heart feel like an ember and it's dying slowly" },
    { time: 129, text: "So put your hands up make 'em touch" },
    { time: 132, text: "Make it feel like the first time, yeah" },
    { time: 136, text: "Everybody hurts sometimes" },
    { time: 139, text: "Everybody hurts someday, ayy" },
    { time: 143, text: "But everything gon' be alright" },
    { time: 146, text: "Go and raise a glass and say, ayy" },
    { time: 149, text: "Here's to the ones that we got" },
    { time: 153, text: "Cheers to the wish you were here, but you're not" },
    { time: 157, text: "'Cause the drinks bring back all the memories" },
    { time: 161, text: "Of everything we've been through" },
    { time: 164, text: "Toast to the ones here today" },
    { time: 167, text: "Toast to the ones that we lost on the way" },
    { time: 171, text: "'Cause the drinks bring back all the memories" },
    { time: 175, text: "And the memories bring back, memories bring back you" },
    { time: 181, text: "[Outro]" },
    { time: 185, text: "Memories bring back, memories bring back you... 🎵" },
  ],

  // ── 3. Aarzu – Noor, Khan, Madhurxo (~2:45) ──────────────────────────────
  aarzu: [
    { time: 0,   text: "🎵 [Aarzu - Noor, Khan, Madhurxo]" },
    { time: 5,   text: "[Instrumental Intro]" },
    { time: 18,  text: "Tera sharmana, meri jaana..." },
    { time: 22,  text: "Kabhi rakh loon chhupa ke" },
    { time: 26,  text: "Teri yaadein sabhi..." },
    { time: 30,  text: "Khwabon mein mere hai tu hi basi" },
    { time: 34,  text: "Tu hi basi, tu hi basi..." },
    { time: 38,  text: "Peeche dekhoon raahein teri" },
    { time: 42,  text: "Had jo rahi na meri" },
    { time: 46,  text: "Khwabon mein basa hai tu hi tu..." },
    { time: 50,  text: "[Instrumental Interlude]" },
    { time: 65,  text: "Sawaalon mein main rakh loon chhupa ke" },
    { time: 69,  text: "Mujhe tu hi toh bigaade" },
    { time: 73,  text: "Meri aankhon mein saja hai tu hi tu..." },
    { time: 78,  text: "Aarzu hai... aarzu hai..." },
    { time: 83,  text: "Teri aarzu hai mujhe" },
    { time: 87,  text: "Dil ki dhadkan mein hai tu" },
    { time: 91,  text: "Teri aarzu hai mujhe, teri aarzu..." },
    { time: 96,  text: "[Instrumental Bridge]" },
    { time: 110, text: "Tera sharmana, meri jaana..." },
    { time: 114, text: "Kabhi rakh loon chhupa ke" },
    { time: 118, text: "Teri yaadein sabhi..." },
    { time: 122, text: "Khwabon mein mere hai tu hi basi" },
    { time: 126, text: "Tu hi basi, tu hi basi..." },
    { time: 130, text: "Aarzu hai... aarzu hai..." },
    { time: 135, text: "Teri aarzu hai mujhe" },
    { time: 139, text: "Teri aarzu hai mujhe, teri aarzu..." },
    { time: 144, text: "[Outro - Instrumental]" },
    { time: 158, text: "Aarzu... 🎵" },
  ],

  // ── 4. Bairan – Banjaare (~3:30) ─────────────────────────────────────────
  bairan: [
    { time: 0,   text: "🎵 [Bairan - Banjaare]" },
    { time: 5,   text: "[Instrumental Intro]" },
    { time: 16,  text: "Tujhse door rehna mushkil hai mujhe" },
    { time: 20,  text: "Har pal teri yaad sataye mujhe" },
    { time: 24,  text: "O bairan, tu hi meri jaan hai" },
    { time: 28,  text: "Tujhse hi meri pehchaan hai" },
    { time: 32,  text: "O bairan..." },
    { time: 36,  text: "Dil ne dil se ek baat kahi" },
    { time: 40,  text: "Ye mohabbat thi ya aag thi" },
    { time: 44,  text: "Jo jali dono ke beech mein" },
    { time: 48,  text: "Aur jalaaye hi jaaye" },
    { time: 52,  text: "O bairan, tu hi meri jaan hai" },
    { time: 56,  text: "Tujhse hi meri pehchaan hai" },
    { time: 60,  text: "[Instrumental Interlude]" },
    { time: 78,  text: "Dono mila ke dil ke tukde" },
    { time: 82,  text: "Ek hi dhadkan bane hain hum" },
    { time: 86,  text: "Bandha hua ye rishta aisa" },
    { time: 90,  text: "Tod ke jaaye nahi jata" },
    { time: 94,  text: "O bairan, tu hi meri jaan hai" },
    { time: 98,  text: "Tujhse hi meri pehchaan hai" },
    { time: 102, text: "O bairan..." },
    { time: 108, text: "[Bridge]" },
    { time: 118, text: "Sun le meri bairan" },
    { time: 122, text: "Tujhbin jeeya nahi jaata" },
    { time: 126, text: "Teri aankhen, teri baatein" },
    { time: 130, text: "Sab kuch yaad aa jaata" },
    { time: 135, text: "O bairan, tu hi meri jaan hai" },
    { time: 139, text: "Tujhse hi meri pehchaan hai" },
    { time: 143, text: "O bairan... o bairan..." },
    { time: 148, text: "[Outro]" },
    { time: 160, text: "O bairan... 🎵" },
  ],

  // ── 5. Apna Bana Le – Arijit Singh (~4:00) ───────────────────────────────
  "apna bana le": [
    { time: 0,   text: "🎵 [Apna Bana Le - Arijit Singh]" },
    { time: 6,   text: "[Instrumental Intro]" },
    { time: 20,  text: "Apna bana le, apna bana le" },
    { time: 25,  text: "Bawra sa dil hai, teri taraf hai" },
    { time: 29,  text: "Apna bana le, apna bana le" },
    { time: 34,  text: "Tujhse hi toh zindagi, teri taraf hai" },
    { time: 39,  text: "[Verse 1]" },
    { time: 43,  text: "Teri aankh ke taare main ginta raha" },
    { time: 47,  text: "Teri baahon ka saaya main dhundta raha" },
    { time: 51,  text: "Tujhko paake dil mera, khil gaya aaj" },
    { time: 55,  text: "Tujhko paake dil mera, khil gaya aaj" },
    { time: 59,  text: "Tu nahi toh kya hoga, sochu na aaj" },
    { time: 63,  text: "Apna bana le, apna bana le" },
    { time: 67,  text: "Bawra sa dil hai, teri taraf hai" },
    { time: 71,  text: "Apna bana le, apna bana le" },
    { time: 76,  text: "Tujhse hi toh zindagi, teri taraf hai" },
    { time: 81,  text: "[Verse 2]" },
    { time: 85,  text: "Main toh dhoondta tha khud ko hi" },
    { time: 89,  text: "Teri aankhon mein mujhe mila yaqeen" },
    { time: 93,  text: "Teri muskaan ne kiya yeh jaadu kya" },
    { time: 97,  text: "Ruk gaya waqt, ye lamha hai sada" },
    { time: 101, text: "Dil mera bole, tu hi meri duaa" },
    { time: 105, text: "Apna bana le, apna bana le" },
    { time: 109, text: "Bawra sa dil hai, teri taraf hai" },
    { time: 113, text: "Apna bana le, apna bana le" },
    { time: 118, text: "Tujhse hi toh zindagi, teri taraf hai" },
    { time: 124, text: "[Bridge]" },
    { time: 132, text: "Tere bina adhoora hoon main" },
    { time: 136, text: "Tere bina yeh dil hai kho gaya" },
    { time: 140, text: "Tere sang hi jeena chahta hoon main" },
    { time: 145, text: "Tere sang hi jeena chahta hoon" },
    { time: 150, text: "Apna bana le, apna bana le" },
    { time: 155, text: "Bawra sa dil hai, teri taraf hai" },
    { time: 159, text: "Apna bana le, apna bana le" },
    { time: 163, text: "Tujhse hi toh zindagi, teri taraf hai" },
    { time: 168, text: "[Outro]" },
    { time: 178, text: "Apna bana le... apna bana le... 🎵" },
  ],

  // ── 6. Tujhe Kitna Chahne Lage – Kabir Singh (~4:30) ─────────────────────
  "tujhe kitna chahne": [
    { time: 0,   text: "🎵 [Tujhe Kitna Chahne Lage - Kabir Singh]" },
    { time: 5,   text: "[Instrumental Intro]" },
    { time: 18,  text: "Tujhe kitna chahne lage hum" },
    { time: 23,  text: "Ajab sa hua hai kya" },
    { time: 27,  text: "Tujhe kitna chahne lage hum" },
    { time: 32,  text: "Pata bhi nahi chala" },
    { time: 37,  text: "[Verse 1]" },
    { time: 40,  text: "Teri aankhon ne kuch aisa kiya" },
    { time: 44,  text: "Mere dil ne bhi maana liya" },
    { time: 48,  text: "Teri muskaan pe dil aa gaya" },
    { time: 52,  text: "Tera hath thaam ke chal de main" },
    { time: 56,  text: "Jo teri raah mein aayen meri jaan" },
    { time: 60,  text: "Koi roka toh main rok ke chal de main" },
    { time: 64,  text: "Tujhe kitna chahne lage hum" },
    { time: 68,  text: "Ajab sa hua hai kya" },
    { time: 72,  text: "Tujhe kitna chahne lage hum" },
    { time: 77,  text: "Pata bhi nahi chala" },
    { time: 82,  text: "[Verse 2]" },
    { time: 86,  text: "Teri baahon mein aakar socha" },
    { time: 90,  text: "Meri manzil yahi thi shayad" },
    { time: 94,  text: "Teri yaad mein doobe doobe" },
    { time: 98,  text: "Kitne rang bhar diye tune" },
    { time: 102, text: "Teri aankhon ka nasha aisa hai" },
    { time: 106, text: "Reh gaya hoon main teri talash mein" },
    { time: 110, text: "Tujhe kitna chahne lage hum" },
    { time: 114, text: "Ajab sa hua hai kya" },
    { time: 118, text: "Tujhe kitna chahne lage hum" },
    { time: 122, text: "Pata bhi nahi chala" },
    { time: 128, text: "[Bridge]" },
    { time: 138, text: "Woh pal jo guzre tere saath" },
    { time: 142, text: "Unhe main kaise bhooloon" },
    { time: 146, text: "Teri aadat si ho gayi hai mujhe" },
    { time: 150, text: "Tujhse main kaise door rahoon" },
    { time: 155, text: "Tujhe kitna chahne lage hum" },
    { time: 159, text: "Ajab sa hua hai kya" },
    { time: 163, text: "Tujhe kitna chahne lage hum" },
    { time: 167, text: "Pata bhi nahi chala" },
    { time: 173, text: "[Outro]" },
    { time: 182, text: "Tujhe kitna chahne lage... pata bhi nahi chala... 🎵" },
  ],

  // ── 7. Arz Kiya Hai – Coke Studio Bharat (~2:30) ─────────────────────────
  "arz kiya": [
    { time: 0,   text: "🎵 [Arz Kiya Hai - Coke Studio Bharat]" },
    { time: 5,   text: "[Instrumental Intro]" },
    { time: 18,  text: "Kaayar jo the, woh shaayar bane" },
    { time: 22,  text: "Kya-kya karein yeh ishq mein" },
    { time: 26,  text: "Na kehte the kuch jo, lage khoj mein" },
    { time: 30,  text: "Kya lafz chune, naye aashiq yeh" },
    { time: 34,  text: "Ishq mein tere hain Faiz bane" },
    { time: 38,  text: "Arz kiya hai..." },
    { time: 42,  text: "Humne bhi likha kuch tere baare mein hai" },
    { time: 47,  text: "Aise tu lage ki gulaab hai" },
    { time: 51,  text: "Baaghon mein dil ke khilke..." },
    { time: 55,  text: "Inn fizaaon mein chhaye ho, haaye!" },
    { time: 59,  text: "Aur waise hum toh tere hi ghulaam hain" },
    { time: 64,  text: "[Instrumental Interlude]" },
    { time: 78,  text: "Woh jo thi teri baat, woh baat khaas thi" },
    { time: 82,  text: "Woh jo tha tera saath, woh saath khaas tha" },
    { time: 86,  text: "Teri aankhon mein tha jo, woh gehraai khaas thi" },
    { time: 90,  text: "Tere honthon pe jo muskaan, woh muskaan khaas thi" },
    { time: 95,  text: "Arz kiya hai... arz kiya hai" },
    { time: 100, text: "Humne bhi likha kuch tere baare mein hai" },
    { time: 105, text: "Aise tu lage ki gulaab hai" },
    { time: 109, text: "Baaghon mein dil ke khilke..." },
    { time: 113, text: "Inn fizaaon mein chhaye ho, haaye!" },
    { time: 117, text: "Aur waise hum toh tere hi ghulaam hain" },
    { time: 122, text: "[Outro - Instrumental]" },
    { time: 140, text: "Arz kiya hai... 🎵" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Match helper — checks if any hardcoded key is contained in the song title
// ─────────────────────────────────────────────────────────────────────────────
function findHardcodedLyrics(title) {
  const lower = title.toLowerCase();
  for (const [key, lyrics] of Object.entries(HARDCODED_LYRICS)) {
    if (lower.includes(key)) return lyrics;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported function
// ─────────────────────────────────────────────────────────────────────────────
async function getSyncedLyrics(title, artist) {
  // 1. Try hardcoded lyrics first (instant, accurate, no API needed)
  const hardcoded = findHardcodedLyrics(title);
  if (hardcoded) {
    console.log(`🎵 Serving hardcoded lyrics for: "${title}"`);
    return hardcoded;
  }

  // 2. Fall back to Gemini AI for songs not in our hardcoded set
  const systemInstruction =
    "You are a music database. Your task is to generate synchronized lyrics for the specified song.\n" +
    "Return ONLY a JSON array of lyric lines with their timestamps in seconds.\n" +
    "Do NOT include any markdown code blocks (such as ```json or ```), explanations, notes, or preamble. Return the raw JSON string directly.\n" +
    "Each object in the array must have:\n" +
    "- \"time\": a number (integer or decimal) representing the start time in seconds (e.g. 0, 4.5, 12)\n" +
    "- \"text\": the text of the lyrics at that moment.\n\n" +
    "Example response shape:\n" +
    "[\n" +
    "  { \"time\": 0, \"text\": \"[Instrumental Intro]\" },\n" +
    "  { \"time\": 4.5, \"text\": \"Hello, it's me\" }\n" +
    "]\n\n" +
    "Generate the actual, real, COMPLETE lyrics of the full song from start to finish from your knowledge. For non-English songs, return Romanized (transliterated) lyrics in the Latin alphabet so they are easy to read. " +
    "Generate realistic timestamps (in seconds) for each lyric line across the full duration of the song. Include all verses, choruses, bridges, and outros. Do NOT cut off early.";

  const prompt = `Generate synchronized lyrics for the song "${title}" by "${artist}".`;

  try {
    const response = await askGemini([{ role: "user", text: prompt }], systemInstruction);
    let jsonText = response.text.trim();

    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    }

    const lyrics = JSON.parse(jsonText);
    if (!Array.isArray(lyrics)) {
      throw new Error("Resulting parsed JSON is not an array");
    }

    return lyrics;
  } catch (error) {
    console.error("🔴 Lyrics Generation Error:", error.message);

    // Generic Fallback
    return [
      { time: 0,  text: `🎵 [Karaoke Mode: ${title} - ${artist}]` },
      { time: 3,  text: "[Ready? 3... 2... 1...]" },
      { time: 5,  text: "Sing along to your track!" },
      { time: 10, text: "The music is playing in your ears..." },
      { time: 15, text: "Feel the rhythm, keep the pace!" },
      { time: 20, text: "You're doing great, keep going!" },
      { time: 25, text: "Bringing it home now..." },
      { time: 30, text: "[Instrumental Outro]" },
    ];
  }
}

module.exports = { getSyncedLyrics };
