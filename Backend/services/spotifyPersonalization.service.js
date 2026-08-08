// services/spotifyPersonalization.service.js
const axios = require("axios");
const { getUserTopTracks, spotifySearchTracks } = require("./spotify.service");
const { askGemini } = require("./gemini.service");

// ─── TMDB genre ID map ────────────────────────────────────────────────────────
const MOOD_TO_TMDB_GENRE = {
  romantic:    10749,
  romance:     10749,
  love:        10749,
  sad:         18,
  emotional:   18,
  drama:       18,
  bollywood:   null,   // handled by keyword search
  party:       35,
  fun:         35,
  comedy:      35,
  happy:       35,
  energetic:   28,
  action:      28,
  "hip-hop":   28,
  hiphop:      28,
  rap:         28,
  horror:      27,
  dark:        27,
  thriller:    53,
  mystery:     9648,
  classic:     36,
  old:         36,
  nostalgia:   36,
  devotional:  10751,
  family:      10751,
  sufi:        18,
  spiritual:   18,
};

// ─── Step 1: Detect mood from user's top tracks via Gemini ───────────────────
async function analyzeListeningMood(tracks) {
  if (!tracks || tracks.length === 0) return { moods: ["popular"], label: "Popular" };

  const trackList = tracks
    .slice(0, 15)
    .map((t) => `"${t.name}" by ${t.artist}`)
    .join(", ");

  const systemInstruction =
    "You are a music mood analyzer. Given a list of songs a user recently listened to, " +
    "identify 1-3 mood/genre tags that best describe their listening taste. " +
    "Choose ONLY from this list: romantic, sad, emotional, party, energetic, action, hiphop, " +
    "bollywood, horror, thriller, mystery, classic, old, nostalgia, family, sufi, devotional, comedy, drama. " +
    "Return ONLY a raw JSON array of lowercase strings. Example: [\"romantic\", \"bollywood\"]. " +
    "No markdown, no explanation.";

  const prompt = `Analyze the mood of this user's listening history: ${trackList}`;

  try {
    const response = await askGemini([{ role: "user", text: prompt }], systemInstruction);
    let text = response.text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    }
    const moods = JSON.parse(text);
    if (!Array.isArray(moods) || moods.length === 0) throw new Error("Invalid moods array");

    // Create human-readable label from top mood
    const topMood = moods[0];
    const label = topMood.charAt(0).toUpperCase() + topMood.slice(1);
    return { moods, label };
  } catch (err) {
    console.warn("⚠️ Mood analysis failed, using fallback:", err.message);
    return { moods: ["romantic"], label: "Romantic" };
  }
}

// ─── Step 2: Get movie recommendations from TMDB based on mood ───────────────
async function getMovieRecsFromMood(moods) {
  const tmdb = require("../lib/tmdb");
  const { mapTMDBItem } = require("./home.service");

  const topMood = moods[0] || "romantic";
  const genreId = MOOD_TO_TMDB_GENRE[topMood];

  try {
    let results = [];

    if (genreId) {
      // Genre-based search
      const { data } = await tmdb.get("/discover/movie", {
        params: {
          with_genres: genreId,
          sort_by: "popularity.desc",
          "vote_count.gte": 100,
          page: 1,
        },
      });
      results = data.results || [];
    } else {
      // Keyword fallback (e.g. bollywood)
      const { data } = await tmdb.get("/search/movie", {
        params: { query: topMood, page: 1 },
      });
      results = data.results || [];
    }

    // Build genre maps for mapTMDBItem
    const [movieGenresRes] = await Promise.all([tmdb.get("/genre/movie/list")]);
    const movieGenreMap = {};
    (movieGenresRes.data.genres || []).forEach((g) => { movieGenreMap[g.id] = g.name; });

    return results
      .slice(0, 15)
      .map((item) => mapTMDBItem({ ...item, media_type: "movie" }, movieGenreMap, {}))
      .filter(Boolean);
  } catch (err) {
    console.error("🔴 Movie recs from mood error:", err.message);
    return [];
  }
}

// ─── Step 3: Get music recommendations from Spotify based on mood ────────────
async function getMusicRecsFromMood(moods) {
  const topMood = moods[0] || "romantic";
  const query = `${topMood} songs`;

  try {
    const tracks = await spotifySearchTracks(query, 10);
    return tracks;
  } catch (err) {
    console.error("🔴 Music recs from mood error:", err.message);
    return [];
  }
}

// ─── Main exported function ───────────────────────────────────────────────────
/**
 * Given a user with spotify.refreshToken, returns personalized movie + music recs.
 * @param {Object} user - Mongoose user document with spotify.refreshToken
 * @returns {{ mood, label, movies, music }}
 */
async function getSpotifyPersonalizedRecs(user) {
  const refreshToken = user?.spotify?.refreshToken;
  if (!refreshToken) throw new Error("No Spotify refresh token found for user");

  // 1. Fetch top tracks
  const topTracks = await getUserTopTracks(refreshToken, 20);

  // 2. Analyze mood
  const { moods, label } = await analyzeListeningMood(topTracks);

  // 3. Fetch movies + music in parallel
  const [movies, music] = await Promise.all([
    getMovieRecsFromMood(moods),
    getMusicRecsFromMood(moods),
  ]);

  return {
    mood: moods[0],
    label,
    movies,
    music,
    topTracks: topTracks.slice(0, 5), // send a few for display purposes
  };
}

module.exports = { getSpotifyPersonalizedRecs };
