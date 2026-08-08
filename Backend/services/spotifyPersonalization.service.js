// services/spotifyPersonalization.service.js

const {
  getRecentlyPlayedTracks,
  spotifySearchTracks,
} = require("./spotify.service");

const { askGemini } = require("./gemini.service");

const tmdb = require("../lib/tmdb");

// ─── TMDB genre IDs ──────────────────────────────────────────────────────────

const MOOD_TO_TMDB_GENRES = {
  romantic: [10749],
  romance: [10749],

  sad: [18],
  emotional: [18],
  drama: [18],
  sufi: [18],
  spiritual: [18],

  comedy: [35],
  happy: [35],
  fun: [35],

  action: [28],
  energetic: [28],
  "hip-hop": [28],
  hiphop: [28],
  rap: [28],

  horror: [27],
  dark: [27],

  thriller: [53],
  mystery: [9648],

  classic: [36],
  old: [36],
  nostalgia: [36],

  family: [10751],

  party: [35],

  bollywood: [],
  devotional: [18],
};

// ─── Step 1: Analyze recently played music ───────────────────────────────────

async function analyzeListeningMood(tracks) {
  if (!tracks || tracks.length === 0) {
    return {
      moods: ["romantic", "emotional"],
      label: "Romantic & Emotional",
    };
  }

  const trackList = tracks
    .slice(0, 20)
    .map((t, index) => `${index + 1}. "${t.name}" by ${t.artist}`)
    .join("\n");

  const systemInstruction = `
You are a music mood analyzer for a movie recommendation platform.

Analyze the user's RECENTLY PLAYED songs and determine the emotional
themes of the music they have been listening to.

You MUST choose 1-3 tags ONLY from this list:

romantic
sad
emotional
party
energetic
action
hiphop
bollywood
horror
thriller
mystery
classic
old
nostalgia
family
sufi
devotional
comedy
drama

IMPORTANT:
- Focus on emotional/mood characteristics of the songs.
- Do NOT return "popular".
- Do NOT return a generic popularity label.
- If the music appears romantic, love-related, heartbreak-related,
  melancholic, or emotional, prefer:
  romantic, sad, emotional.
- For songs that suggest love/relationships/heartbreak, return
  "romantic" and/or "sad".
- Return ONLY a raw JSON array.
- No markdown.
- No explanation.

Example:
["romantic", "sad"]

Another example:
["romantic", "emotional"]
`;

  const prompt = `
Analyze the user's recently played music:

${trackList}
`;

  try {
    const response = await askGemini(
      [{ role: "user", text: prompt }],
      systemInstruction,
    );

    let text = response.text.trim();

    if (text.startsWith("```")) {
      text = text
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/i, "")
        .trim();
    }

    const moods = JSON.parse(text);

    if (!Array.isArray(moods) || moods.length === 0) {
      throw new Error("Invalid moods array");
    }

    const allowedMoods = Object.keys(MOOD_TO_TMDB_GENRES);

    const validMoods = moods
      .map((mood) => String(mood).toLowerCase().trim())
      .filter((mood) => allowedMoods.includes(mood) && mood !== "popular")
      .slice(0, 3);

    if (validMoods.length === 0) {
      throw new Error("No valid moods returned");
    }

    const labels = validMoods.map(
      (mood) => mood.charAt(0).toUpperCase() + mood.slice(1),
    );

    return {
      moods: validMoods,
      label: labels.join(" & "),
    };
  } catch (err) {
    console.warn(
      "Mood analysis failed, using romantic/emotional fallback:",
      err.message,
    );

    return {
      moods: ["romantic", "emotional"],
      label: "Romantic & Emotional",
    };
  }
}

// ─── Step 2: Get movie recommendations from mood ─────────────────────────────

async function getMovieRecsFromMood(moods) {
  try {
    const genres = new Set();

    for (const mood of moods) {
      const moodGenres = MOOD_TO_TMDB_GENRES[mood] || [];

      moodGenres.forEach((genre) => genres.add(genre));
    }

    /*
     * If the user listens to romantic/sad/emotional music,
     * this gives us:
     *
     * Romance + Drama
     *
     * rather than only one genre.
     */
    if (genres.size === 0) {
      genres.add(10749);
      genres.add(18);
    }

    const genreIds = Array.from(genres);

    const requests = [
      tmdb.get("/discover/movie", {
        params: {
          with_genres: genreIds.join("|"),
          sort_by: "vote_average.desc",
          "vote_count.gte": 100,
          page: 1,
        },
      }),

      tmdb.get("/discover/movie", {
        params: {
          with_genres: genreIds.join("|"),
          sort_by: "popularity.desc",
          "vote_count.gte": 100,
          page: 2,
        },
      }),
    ];

    const responses = await Promise.all(requests);

    const unique = new Map();

    responses.forEach((response) => {
      for (const movie of response.data.results || []) {
        if (!unique.has(movie.id)) {
          unique.set(movie.id, movie);
        }
      }
    });

    /*
     * Get genre names so MediaCard can display them.
     */
    const { data: genreData } = await tmdb.get("/genre/movie/list");

    const genreMap = {};

    for (const genre of genreData.genres || []) {
      genreMap[genre.id] = genre.name;
    }

    return Array.from(unique.values())
      .slice(0, 15)
      .map((movie) => ({
        id: movie.id,
        type: "movie",

        title: movie.title,

        cover_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "",

        backdrop_url: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
          : "",

        avg_rating: Number((movie.vote_average / 2).toFixed(1)),

        release_year: movie.release_date
          ? Number(movie.release_date.substring(0, 4))
          : null,

        genres: (movie.genre_ids || [])
          .map((id) => genreMap[id])
          .filter(Boolean),

        language: movie.original_language,

        description: movie.overview || "",
      }));
  } catch (err) {
    console.error("Movie recommendations from mood error:", err.message);

    return [];
  }
}

// ─── Step 3: Spotify music recommendations ──────────────────────────────────

async function getMusicRecsFromMood(moods) {
  const topMood = moods[0] || "romantic";

  const query = `${topMood} songs`;

  try {
    return await spotifySearchTracks(query, 10);
  } catch (err) {
    console.error("Music recommendations from mood error:", err.message);

    return [];
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function getSpotifyPersonalizedRecs(user) {
  const refreshToken = user?.spotify?.refreshToken;

  if (!refreshToken) {
    throw new Error("No Spotify refresh token found for user");
  }

  // Get RECENTLY PLAYED instead of top tracks
  const recentlyPlayed = await getRecentlyPlayedTracks(refreshToken, 20);

  // Analyze recent listening
  const { moods, label } = await analyzeListeningMood(recentlyPlayed);

  // Get movie + music recommendations
  const [movies, music] = await Promise.all([
    getMovieRecsFromMood(moods),
    getMusicRecsFromMood(moods),
  ]);

  return {
    mood: moods[0],
    moods,
    label,

    movies,
    music,

    // Used for displaying "based on your recent listening"
    topTracks: recentlyPlayed.slice(0, 5),
  };
}

module.exports = {
  getSpotifyPersonalizedRecs,
};
