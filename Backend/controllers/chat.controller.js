// // controllers/chat.controller.js
// const tmdbService = require("../services/tmdb.service");
// const deezerService = require("../services/deezer.service");
// const geminiService = require("../services/gemini.service");
// const promptService = require("../services/prompt.service");
// const { detectIntent } = require("../services/intent.service");

// const sessions = {};

// const geminiCache = new Map();
// const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// function getCached(key) {
//   const hit = geminiCache.get(key);
//   if (hit && Date.now() - hit.ts < CACHE_TTL) return hit;
//   return null;
// }
// function setCached(key, text, sources) {
//   geminiCache.set(key, { text, sources, ts: Date.now() });
// }

// function getSession(sessionId) {
//   if (!sessions[sessionId]) {
//     sessions[sessionId] = { context: null, history: [] };
//   }
//   return sessions[sessionId];
// }

// // Tags a TMDB result as "anime" when it's Animation genre + Japanese origin.
// function tagAnime(result) {
//   const isAnimeGenre = (result.genre_ids || []).includes(16); // Animation
//   const isJapanese =
//     result.origin_country?.includes("JP") || result.original_language === "ja";
//   return isAnimeGenre && isJapanese;
// }

// async function buildMovieCard(tmdbId, mediaType) {
//   const details = await tmdbService.getDetails(tmdbId, mediaType);
//   const durationMin = details.runtime || details.episode_run_time?.[0] || null;

//   const isAnime =
//     (details.genres || []).some((g) => g.id === 16) &&
//     (details.origin_country?.includes("JP") || details.original_language === "ja");

//   return {
//     tmdbId,
//     mediaType: isAnime ? "anime" : mediaType,
//     title: details.title || details.name,
//     year: (details.release_date || details.first_air_date || "").slice(0, 4),
//     genres: (details.genres || []).map((g) => g.name).join(", "),
//     duration: durationMin
//       ? mediaType === "movie"
//         ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
//         : `${durationMin}m/ep`
//       : null,
//     poster: details.poster_path
//       ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
//       : null,
//     overview: details.overview,
//     rating: details.vote_average ? Number((details.vote_average / 2).toFixed(1)) : null,
//   };
// }

// async function searchTitle(req, res) {
//   try {
//     const { sessionId, query, mode } = req.body;
//     // mode = "song" | "media" — sent by frontend based on which button the user tapped
//     if (!sessionId || !query || !mode) {
//       return res.status(400).json({ error: "sessionId, query, and mode are required" });
//     }
//     if (!["song", "media"].includes(mode)) {
//       return res.status(400).json({ error: "mode must be 'song' or 'media'" });
//     }

//     const cleanQuery = query
//       .replace(/\b(tell|me|about|storyline|of|the|movie|show|series|anime|song)\b/gi, "")
//       .trim();
//     const searchQuery = cleanQuery || query;

//     const shouldSearchTmdb = mode === "media";
//     const shouldSearchDeezer = mode === "song";

//     const [tmdbResult, deezerResult] = await Promise.allSettled([
//       shouldSearchTmdb ? tmdbService.searchTitle(searchQuery) : Promise.resolve([]),
//       shouldSearchDeezer ? deezerService.searchTrack(searchQuery, 5) : Promise.resolve([]),
//     ]);

//     if (shouldSearchTmdb && tmdbResult.status === "rejected") {
//       console.error("searchTitle -> tmdb failed:", tmdbResult.reason?.code || tmdbResult.reason?.message);
//     }
//     if (shouldSearchDeezer && deezerResult.status === "rejected") {
//       console.error("searchTitle -> deezer failed:", deezerResult.reason?.code || deezerResult.reason?.message);
//     }

//     const tmdbMatches = tmdbResult.status === "fulfilled" ? tmdbResult.value : [];
//     const songMatches = deezerResult.status === "fulfilled" ? deezerResult.value : [];

//     const movieOptions = tmdbMatches.map((r) => ({
//       tmdbId: r.id,
//       mediaType: tagAnime(r) ? "anime" : r.media_type,
//       title: r.title || r.name,
//       year: (r.release_date || r.first_air_date || "").slice(0, 4),
//       poster: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
//       overview: r.overview,
//     }));

//     const songOptions = songMatches.map((s) => ({
//       deezerId: s.deezerId,
//       artistId: s.artistId,
//       mediaType: "song",
//       title: s.title,
//       artist: s.artist,
//       album: s.album,
//       year: s.year,
//       poster: s.cover,
//       overview: `by ${s.artist}${s.album ? ` · ${s.album}` : ""}`,
//       previewUrl: s.previewUrl,
//       deezerUrl: s.deezerUrl,
//       durationMs: s.durationMs,
//     }));

//     const combined = mode === "song" ? songOptions : movieOptions;

//     if (combined.length === 0) {
//       const searchedSourceFailed =
//         (shouldSearchTmdb && tmdbResult.status === "rejected") ||
//         (shouldSearchDeezer && deezerResult.status === "rejected");

//       if (searchedSourceFailed) {
//         return res.status(502).json({
//           error: "Couldn't reach search providers right now. Please try again in a moment.",
//         });
//       }
//       return res.json({
//         status: "not_found",
//         message: `I couldn't find anything matching "${query}" ${
//           mode === "song" ? "in songs" : "in movies, TV, or anime"
//         }. Could you check the spelling or add more detail?`,
//       });
//     }

//     if (combined.length > 1) {
//       return res.json({ status: "ambiguous", options: combined.slice(0, 6) });
//     }

//     const only = combined[0];
//     const session = getSession(sessionId);

//     if (only.mediaType === "song") {
//       const track = songMatches[0];
//       session.context = {
//         mediaType: "song",
//         deezerId: track.deezerId,
//         artistId: track.artistId,
//         title: track.title,
//         artist: track.artist,
//         album: track.album,
//       };
//       session.history = [];
//       return res.json({ status: "resolved", card: track });
//     }

//     const card = await buildMovieCard(only.tmdbId, only.mediaType);
//     session.context = {
//       mediaType: card.mediaType,
//       tmdbId: card.tmdbId,
//       title: card.title,
//       year: card.year,
//     };
//     session.history = [];
//     return res.json({ status: "resolved", card });
//   } catch (err) {
//     console.error("searchTitle error:", err.message);
//     return res.status(500).json({ error: "Something went wrong while searching." });
//   }
// }

// async function selectTitle(req, res) {
//   try {
//     const { sessionId, mediaType, tmdbId, deezerId, artistId } = req.body;
//     const session = getSession(sessionId);

//     if (mediaType === "song") {
//       const { title, artist, album, cover, previewUrl, deezerUrl, year, durationMs } = req.body;
//       session.context = { mediaType: "song", deezerId, artistId, title, artist, album };
//       session.history = [];
//       return res.json({
//         status: "resolved",
//         card: { deezerId, mediaType: "song", title, artist, album, year, cover, previewUrl, deezerUrl, durationMs },
//       });
//     }

//     const card = await buildMovieCard(tmdbId, mediaType);
//     session.context = { mediaType: card.mediaType, tmdbId: card.tmdbId, title: card.title, year: card.year };
//     session.history = [];
//     return res.json({ status: "resolved", card });
//   } catch (err) {
//     console.error("selectTitle error:", err.message);
//     return res.status(500).json({ error: "Couldn't load that title." });
//   }
// }

// async function handleMessage(req, res) {
//   try {
//     const { sessionId, message, buttonIntent } = req.body;
//     const session = getSession(sessionId);

//     if (!session.context) {
//       return res.status(400).json({ error: "No title selected yet. Search for one first." });
//     }

//     const ctx = session.context;
//     const intent = detectIntent(buttonIntent, message);

//     if (ctx.mediaType === "song") {
//       if (intent === "similar") {
//         const tracks = await deezerService.getArtistTopTracks(ctx.artistId);
//         return res.json({ intent, source: "deezer", data: tracks });
//       }

//       const cacheKey = `${ctx.deezerId}-about`;
//       if (intent === "about" && session.history.length === 0) {
//         const cached = getCached(cacheKey);
//         if (cached) {
//           session.history.push({ role: "user", text: "about" }, { role: "assistant", text: cached.text });
//           return res.json({ intent, source: "gemini-cache", data: { text: cached.text, sources: cached.sources } });
//         }
//       }

//       const systemContext = promptService.buildSongSystemContext(ctx);
//       const userText =
//         intent === "about" && session.history.length === 0
//           ? promptService.buildAboutSongPrompt(ctx)
//           : promptService.buildFollowUpPrompt(message);

//       session.history.push({ role: "user", text: userText });
//       const { text, sources } = await geminiService.askGemini(session.history, systemContext);
//       session.history.push({ role: "assistant", text });
//       if (session.history.length > 10) session.history = session.history.slice(-10);

//       if (intent === "about" && session.history.length === 2) {
//         setCached(cacheKey, text, sources);
//       }

//       return res.json({ intent, source: "gemini", data: { text, sources } });
//     }

//     const { tmdbId, mediaType, title, year } = ctx;

//     switch (intent) {
//       case "cast": {
//         const credits = await tmdbService.getCredits(tmdbId, mediaType);
//         return res.json({ intent, source: "tmdb", data: credits });
//       }
//       case "rating": {
//         const ratings = await tmdbService.getRatings(tmdbId, mediaType);
//         return res.json({ intent, source: "tmdb", data: ratings });
//       }
//       case "reviews": {
//         const reviews = await tmdbService.getReviews(tmdbId, mediaType);
//         return res.json({ intent, source: "tmdb", data: reviews });
//       }
//       case "similar": {
//         const similar = await tmdbService.getSimilar(tmdbId, mediaType);
//         return res.json({ intent, source: "tmdb", data: similar });
//       }
//     }

//     const cacheKey = `${tmdbId}-storyline`;
//     if (intent === "storyline" && session.history.length === 0) {
//       const cached = getCached(cacheKey);
//       if (cached) {
//         session.history.push({ role: "user", text: "storyline" }, { role: "assistant", text: cached.text });
//         return res.json({ intent, source: "gemini-cache", data: { text: cached.text, sources: cached.sources } });
//       }
//     }

//     const systemContext = promptService.buildSystemContext({ title, year, mediaType });
//     const userText =
//       intent === "storyline" && session.history.length === 0
//         ? promptService.buildStorylinePrompt({ title, year, mediaType })
//         : promptService.buildFollowUpPrompt(message);

//     session.history.push({ role: "user", text: userText });
//     const { text, sources } = await geminiService.askGemini(session.history, systemContext);
//     session.history.push({ role: "assistant", text });
//     if (session.history.length > 10) session.history = session.history.slice(-10);

//     if (intent === "storyline" && session.history.length === 2) {
//       setCached(cacheKey, text, sources);
//     }

//     return res.json({ intent, source: "gemini", data: { text, sources } });
//   } catch (err) {
//     console.error("handleMessage error:", err.message);
//     if (err.isRateLimit) {
//       return res.status(429).json({ error: err.message });
//     }
//     return res.status(500).json({ error: "Something went wrong answering that." });
//   }
// }

// module.exports = { searchTitle, selectTitle, handleMessage };

// controllers/chat.controller.js
const tmdbService = require("../services/tmdb.service");
const spotifyService = require("../services/spotify.service");
const geminiService = require("../services/gemini.service");
const promptService = require("../services/prompt.service");
const { detectIntent } = require("../services/intent.service");

const sessions = {};

const geminiCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCached(key) {
  const hit = geminiCache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit;
  return null;
}
function setCached(key, text, sources) {
  geminiCache.set(key, { text, sources, ts: Date.now() });
}

function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = { context: null, history: [] };
  }
  return sessions[sessionId];
}

// Tags a TMDB result as "anime" when it's Animation genre + Japanese origin.
function tagAnime(result) {
  const isAnimeGenre = (result.genre_ids || []).includes(16); // Animation
  const isJapanese =
    result.origin_country?.includes("JP") || result.original_language === "ja";
  return isAnimeGenre && isJapanese;
}

async function buildMovieCard(tmdbId, mediaType) {
  const details = await tmdbService.getDetails(tmdbId, mediaType);
  const durationMin = details.runtime || details.episode_run_time?.[0] || null;

  const isAnime =
    (details.genres || []).some((g) => g.id === 16) &&
    (details.origin_country?.includes("JP") || details.original_language === "ja");

  return {
    tmdbId,
    mediaType: isAnime ? "anime" : mediaType,
    title: details.title || details.name,
    year: (details.release_date || details.first_air_date || "").slice(0, 4),
    genres: (details.genres || []).map((g) => g.name).join(", "),
    duration: durationMin
      ? mediaType === "movie"
        ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
        : `${durationMin}m/ep`
      : null,
    poster: details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : null,
    overview: details.overview,
    rating: details.vote_average ? Number((details.vote_average / 2).toFixed(1)) : null,
  };
}

async function searchTitle(req, res) {
  try {
    const { sessionId, query, mode } = req.body;
    // mode = "song" | "media" — sent by frontend based on which button the user tapped
    if (!sessionId || !query || !mode) {
      return res.status(400).json({ error: "sessionId, query, and mode are required" });
    }
    if (!["song", "media"].includes(mode)) {
      return res.status(400).json({ error: "mode must be 'song' or 'media'" });
    }

    const cleanQuery = query
      .replace(/\b(tell|me|about|storyline|of|the|movie|show|series|anime|song)\b/gi, "")
      .trim();
    const searchQuery = cleanQuery || query;

    const shouldSearchTmdb = mode === "media";
    const shouldSearchSpotify = mode === "song";

    const [tmdbResult, spotifyResult] = await Promise.allSettled([
      shouldSearchTmdb ? tmdbService.searchTitle(searchQuery) : Promise.resolve([]),
      shouldSearchSpotify ? spotifyService.searchTrack(searchQuery, 5) : Promise.resolve([]),
    ]);

    if (shouldSearchTmdb && tmdbResult.status === "rejected") {
      console.error("searchTitle -> tmdb failed:", tmdbResult.reason?.code || tmdbResult.reason?.message);
    }
    if (shouldSearchSpotify && spotifyResult.status === "rejected") {
      console.error("searchTitle -> spotify failed:", spotifyResult.reason?.code || spotifyResult.reason?.message);
    }

    const tmdbMatches = tmdbResult.status === "fulfilled" ? tmdbResult.value : [];
    const songMatches = spotifyResult.status === "fulfilled" ? spotifyResult.value : [];

    const movieOptions = tmdbMatches.map((r) => ({
      tmdbId: r.id,
      mediaType: tagAnime(r) ? "anime" : r.media_type,
      title: r.title || r.name,
      year: (r.release_date || r.first_air_date || "").slice(0, 4),
      poster: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
      overview: r.overview,
    }));

    const songOptions = songMatches.map((s) => ({
      deezerId: s.deezerId, // now actually a Spotify track id — field name kept for frontend compatibility
      artistId: s.artistId,
      mediaType: "song",
      title: s.title,
      artist: s.artist,
      album: s.album,
      year: s.year,
      poster: s.cover,
      overview: `by ${s.artist}${s.album ? ` · ${s.album}` : ""}`,
      previewUrl: s.previewUrl,
      deezerUrl: s.deezerUrl, // now actually the Spotify URL — field name kept for frontend compatibility
      durationMs: s.durationMs,
    }));

    const combined = mode === "song" ? songOptions : movieOptions;

    if (combined.length === 0) {
      const searchedSourceFailed =
        (shouldSearchTmdb && tmdbResult.status === "rejected") ||
        (shouldSearchSpotify && spotifyResult.status === "rejected");

      if (searchedSourceFailed) {
        return res.status(502).json({
          error: "Couldn't reach search providers right now. Please try again in a moment.",
        });
      }
      return res.json({
        status: "not_found",
        message: `I couldn't find anything matching "${query}" ${
          mode === "song" ? "in songs" : "in movies, TV, or anime"
        }. Could you check the spelling or add more detail?`,
      });
    }

    if (combined.length > 1) {
      return res.json({ status: "ambiguous", options: combined.slice(0, 6) });
    }

    const only = combined[0];
    const session = getSession(sessionId);

    if (only.mediaType === "song") {
      const track = songMatches[0];
      session.context = {
        mediaType: "song",
        deezerId: track.deezerId,
        artistId: track.artistId,
        title: track.title,
        artist: track.artist,
        album: track.album,
      };
      session.history = [];
      return res.json({ status: "resolved", card: track });
    }

    const card = await buildMovieCard(only.tmdbId, only.mediaType);
    session.context = {
      mediaType: card.mediaType,
      tmdbId: card.tmdbId,
      title: card.title,
      year: card.year,
    };
    session.history = [];
    return res.json({ status: "resolved", card });
  } catch (err) {
    console.error("searchTitle error:", err.message);
    return res.status(500).json({ error: "Something went wrong while searching." });
  }
}

async function selectTitle(req, res) {
  try {
    const { sessionId, mediaType, tmdbId, deezerId, artistId } = req.body;
    const session = getSession(sessionId);

    if (mediaType === "song") {
      const { title, artist, album, cover, previewUrl, deezerUrl, year, durationMs } = req.body;
      session.context = { mediaType: "song", deezerId, artistId, title, artist, album };
      session.history = [];
      return res.json({
        status: "resolved",
        card: { deezerId, mediaType: "song", title, artist, album, year, cover, previewUrl, deezerUrl, durationMs },
      });
    }

    const card = await buildMovieCard(tmdbId, mediaType);
    session.context = { mediaType: card.mediaType, tmdbId: card.tmdbId, title: card.title, year: card.year };
    session.history = [];
    return res.json({ status: "resolved", card });
  } catch (err) {
    console.error("selectTitle error:", err.message);
    return res.status(500).json({ error: "Couldn't load that title." });
  }
}

async function handleMessage(req, res) {
  try {
    const { sessionId, message, buttonIntent } = req.body;
    const session = getSession(sessionId);

    if (!session.context) {
      return res.status(400).json({ error: "No title selected yet. Search for one first." });
    }

    const ctx = session.context;
    const intent = detectIntent(buttonIntent, message);

    if (ctx.mediaType === "song") {
      if (intent === "similar") {
        const tracks = await spotifyService.getArtistTopTracks(ctx.artistId);
        return res.json({ intent, source: "spotify", data: tracks });
      }

      const cacheKey = `${ctx.deezerId}-about`;
      if (intent === "about" && session.history.length === 0) {
        const cached = getCached(cacheKey);
        if (cached) {
          session.history.push({ role: "user", text: "about" }, { role: "assistant", text: cached.text });
          return res.json({ intent, source: "gemini-cache", data: { text: cached.text, sources: cached.sources } });
        }
      }

      const systemContext = promptService.buildSongSystemContext(ctx);
      const userText =
        intent === "about" && session.history.length === 0
          ? promptService.buildAboutSongPrompt(ctx)
          : promptService.buildFollowUpPrompt(message);

      session.history.push({ role: "user", text: userText });
      const { text, sources } = await geminiService.askGemini(session.history, systemContext);
      session.history.push({ role: "assistant", text });
      if (session.history.length > 10) session.history = session.history.slice(-10);

      if (intent === "about" && session.history.length === 2) {
        setCached(cacheKey, text, sources);
      }

      return res.json({ intent, source: "gemini", data: { text, sources } });
    }

    const { tmdbId, mediaType, title, year } = ctx;

    switch (intent) {
      case "cast": {
        const credits = await tmdbService.getCredits(tmdbId, mediaType);
        return res.json({ intent, source: "tmdb", data: credits });
      }
      case "rating": {
        const ratings = await tmdbService.getRatings(tmdbId, mediaType);
        return res.json({ intent, source: "tmdb", data: ratings });
      }
      case "reviews": {
        const reviews = await tmdbService.getReviews(tmdbId, mediaType);
        return res.json({ intent, source: "tmdb", data: reviews });
      }
      case "similar": {
        const similar = await tmdbService.getSimilar(tmdbId, mediaType);
        return res.json({ intent, source: "tmdb", data: similar });
      }
    }

    const cacheKey = `${tmdbId}-storyline`;
    if (intent === "storyline" && session.history.length === 0) {
      const cached = getCached(cacheKey);
      if (cached) {
        session.history.push({ role: "user", text: "storyline" }, { role: "assistant", text: cached.text });
        return res.json({ intent, source: "gemini-cache", data: { text: cached.text, sources: cached.sources } });
      }
    }

    const systemContext = promptService.buildSystemContext({ title, year, mediaType });
    const userText =
      intent === "storyline" && session.history.length === 0
        ? promptService.buildStorylinePrompt({ title, year, mediaType })
        : promptService.buildFollowUpPrompt(message);

    session.history.push({ role: "user", text: userText });
    const { text, sources } = await geminiService.askGemini(session.history, systemContext);
    session.history.push({ role: "assistant", text });
    if (session.history.length > 10) session.history = session.history.slice(-10);

    if (intent === "storyline" && session.history.length === 2) {
      setCached(cacheKey, text, sources);
    }

    return res.json({ intent, source: "gemini", data: { text, sources } });
  } catch (err) {
    console.error("handleMessage error:", err.message);
    if (err.isRateLimit) {
      return res.status(429).json({ error: err.message });
    }
    return res.status(500).json({ error: "Something went wrong answering that." });
  }
}

module.exports = { searchTitle, selectTitle, handleMessage };