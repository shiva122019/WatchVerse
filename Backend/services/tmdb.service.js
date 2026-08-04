// const axios = require("axios");
// const https = require("https");

// // Reuse TCP/TLS connections instead of opening a new one per request.
// // This alone fixes most ECONNRESET issues under Windows/dev environments.
// const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 20 });

// const tmdb = axios.create({
//   baseURL: "https://api.themoviedb.org/3",
//   headers: {
//     accept: "application/json",
//     Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
//   },
//   timeout: 10000,
//   httpsAgent: keepAliveAgent,
// });

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// // Retry helper for transient network errors only (not for 4xx/5xx from TMDB itself).
// async function requestWithRetry(config, attempt = 0) {
//   try {
//     return await tmdb.request(config);
//   } catch (err) {
//     const transient = ["ECONNRESET", "ETIMEDOUT", "ECONNABORTED"].includes(err.code);
//     if (transient && attempt < 2) {
//       await sleep(300 * (attempt + 1)); // 300ms, 600ms
//       return requestWithRetry(config, attempt + 1);
//     }
//     throw err;
//   }
// }

// async function searchTitle(query) {
//   const { data } = await requestWithRetry({
//     method: "get",
//     url: "/search/multi",
//     params: { query, include_adult: false },
//   });

//   return (data.results || []).filter(
//     (r) => r.media_type === "movie" || r.media_type === "tv",
//   );
// }

// async function getDetails(tmdbId, mediaType) {
//   const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}` });
//   return data;
// }

// async function getCredits(tmdbId, mediaType) {
//   const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/credits` });

//   return {
//     cast: (data.cast || []).slice(0, 12).map((c) => ({
//       name: c.name,
//       character: c.character,
//       profile_path: c.profile_path
//         ? `https://image.tmdb.org/t/p/w200${c.profile_path}`
//         : null,
//     })),
//     crew: (data.crew || [])
//       .filter((c) => ["Director", "Writer", "Creator"].includes(c.job))
//       .map((c) => ({ name: c.name, job: c.job })),
//   };
// }

// async function getRatings(tmdbId, mediaType) {
//   const data = await getDetails(tmdbId, mediaType);
//   return {
//     tmdb_score: Number((data.vote_average / 2).toFixed(1)),
//     vote_count: data.vote_count,
//     popularity: data.popularity,
//   };
// }

// async function getReviews(tmdbId, mediaType) {
//   const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/reviews` });
//   return (data.results || []).slice(0, 5).map((r) => ({
//     author: r.author,
//     content: r.content,
//     rating: r.author_details?.rating || null,
//   }));
// }

// async function getVideos(tmdbId, mediaType) {
//   const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/videos` });
//   const vids = data.results || [];

//   // Prefer an official YouTube trailer, then any YouTube trailer,
//   // then a teaser, then just take whatever YouTube video exists.
//   const best =
//     vids.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
//     vids.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
//     vids.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
//     vids.find((v) => v.site === "YouTube");

//   return best ? best.key : null;
// }

// async function getSimilar(tmdbId, mediaType) {
//   const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/similar` });
//   return (data.results || []).slice(0, 8).map((r) => ({
//     id: r.id,
//     title: r.title || r.name,
//     cover_url: r.poster_path
//       ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
//       : null,
//     release_year: (r.release_date || r.first_air_date || "").slice(0, 4),
//   }));
// }

// async function getGenres() {
//   const [movieRes, tvRes] = await Promise.all([
//     requestWithRetry({ method: "get", url: "/genre/movie/list" }),
//     requestWithRetry({ method: "get", url: "/genre/tv/list" }),
//   ]);

//   // TMDB uses separate id spaces for movie vs tv genres, even when the
//   // name is identical (e.g. "Action" vs "Action & Adventure"), so we key
//   // by name and keep both ids where they exist.
//   const byName = new Map();
//   (movieRes.data.genres || []).forEach((g) => {
//     byName.set(g.name, { name: g.name, movieId: g.id, tvId: null });
//   });
//   (tvRes.data.genres || []).forEach((g) => {
//     const existing = byName.get(g.name);
//     if (existing) existing.tvId = g.id;
//     else byName.set(g.name, { name: g.name, movieId: null, tvId: g.id });
//   });

//   return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
// }

// function normalizeDiscoverResult(r, mediaType, genre) {
//   return {
//     id: r.id,
//     mediaType,
//     genre,
//     title: r.title || r.name,
//     posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
//     year: (r.release_date || r.first_air_date || "").slice(0, 4),
//     rating: Number((r.vote_average / 2).toFixed(1)), // matches your existing /5 scale
//     popularity: r.popularity,
//   };
// }

// // Pulls both a "top rated" and a "latest" slice per genre, for both movies
// // and tv where the genre applies. vote_average.gte:8 on TMDB's /10 scale
// // is ~4/5 in this app's rating scale.
// async function discoverByGenres(genreNames) {
//   const allGenres = await getGenres();
//   const wanted = allGenres.filter((g) => genreNames.includes(g.name));

//   const out = [];
//   for (const g of wanted) {
//     const items = [];

//     for (const [mediaType, genreId] of [
//       ["movie", g.movieId],
//       ["tv", g.tvId],
//     ]) {
//       if (!genreId) continue;

//       const [topRes, latestRes] = await Promise.all([
//         requestWithRetry({
//           method: "get",
//           url: `/discover/${mediaType}`,
//           params: {
//             with_genres: genreId,
//             sort_by: "vote_average.desc",
//             "vote_count.gte": 200,
//             "vote_average.gte": 8,
//             include_adult: false,
//           },
//         }),
//         requestWithRetry({
//           method: "get",
//           url: `/discover/${mediaType}`,
//           params: {
//             with_genres: genreId,
//             sort_by: mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc",
//             "vote_count.gte": 20,
//             include_adult: false,
//           },
//         }),
//       ]);

//       items.push(
//         ...(topRes.data.results || []).slice(0, 6).map((r) => ({
//           ...normalizeDiscoverResult(r, mediaType, g.name),
//           bucket: "top_rated",
//         })),
//         ...(latestRes.data.results || []).slice(0, 6).map((r) => ({
//           ...normalizeDiscoverResult(r, mediaType, g.name),
//           bucket: "latest",
//         })),
//       );
//     }

//     // de-dupe in case a title shows up in both buckets
//     const seen = new Set();
//     const deduped = items.filter((it) => {
//       const key = `${it.mediaType}-${it.id}`;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });

//     out.push({
//       genre: g.name,
//       topRated: deduped.filter((it) => it.bucket === "top_rated"),
//       latest: deduped.filter((it) => it.bucket === "latest"),
//     });
//   }

//   return out;
// }

// // Random pick across every selected genre's pool, restricted to
// // well-rated + recent titles (same quality bar as the suggestion lists).
// async function getSurprisePick(genreNames) {
//   const suggestions = await discoverByGenres(genreNames);
//   const pool = suggestions.flatMap((s) => [...s.topRated, ...s.latest]);

//   if (pool.length === 0) return null;

//   const seen = new Set();
//   const uniquePool = pool.filter((it) => {
//     const key = `${it.mediaType}-${it.id}`;
//     if (seen.has(key)) return false;
//     seen.add(key);
//     return true;
//   });

//   return uniquePool[Math.floor(Math.random() * uniquePool.length)];
// }

// module.exports = {
//   searchTitle,
//   getDetails,
//   getCredits,
//   getRatings,
//   getReviews,
//   getSimilar,
//   getVideos,
//   getGenres,
//   discoverByGenres,
//   getSurprisePick,
// };

const axios = require("axios");
const https = require("https");

// Reuse TCP/TLS connections instead of opening a new one per request.
// This alone fixes most ECONNRESET issues under Windows/dev environments.
const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 20 });

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
  timeout: 10000,
  httpsAgent: keepAliveAgent,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry helper for transient network errors only (not for 4xx/5xx from TMDB itself).
async function requestWithRetry(config, attempt = 0) {
  try {
    return await tmdb.request(config);
  } catch (err) {
    const transient = ["ECONNRESET", "ETIMEDOUT", "ECONNABORTED"].includes(err.code);
    if (transient && attempt < 2) {
      await sleep(300 * (attempt + 1)); // 300ms, 600ms
      return requestWithRetry(config, attempt + 1);
    }
    throw err;
  }
}

async function searchTitle(query) {
  const { data } = await requestWithRetry({
    method: "get",
    url: "/search/multi",
    params: { query, include_adult: false },
  });

  return (data.results || []).filter(
    (r) => r.media_type === "movie" || r.media_type === "tv",
  );
}

async function getDetails(tmdbId, mediaType) {
  const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}` });
  return data;
}

async function getCredits(tmdbId, mediaType) {
  const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/credits` });

  return {
    cast: (data.cast || []).slice(0, 12).map((c) => ({
      name: c.name,
      character: c.character,
      profile_path: c.profile_path
        ? `https://image.tmdb.org/t/p/w200${c.profile_path}`
        : null,
    })),
    crew: (data.crew || [])
      .filter((c) => ["Director", "Writer", "Creator"].includes(c.job))
      .map((c) => ({ name: c.name, job: c.job })),
  };
}

async function getRatings(tmdbId, mediaType) {
  const data = await getDetails(tmdbId, mediaType);
  return {
    tmdb_score: Number((data.vote_average / 2).toFixed(1)),
    vote_count: data.vote_count,
    popularity: data.popularity,
  };
}

async function getReviews(tmdbId, mediaType) {
  const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/reviews` });
  return (data.results || []).slice(0, 5).map((r) => ({
    author: r.author,
    content: r.content,
    rating: r.author_details?.rating || null,
  }));
}

async function getVideos(tmdbId, mediaType) {
  const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/videos` });
  const vids = data.results || [];

  // Prefer an official YouTube trailer, then any YouTube trailer,
  // then a teaser, then just take whatever YouTube video exists.
  const best =
    vids.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    vids.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    vids.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
    vids.find((v) => v.site === "YouTube");

  return best ? best.key : null;
}

async function getSimilar(tmdbId, mediaType) {
  const { data } = await requestWithRetry({ method: "get", url: `/${mediaType}/${tmdbId}/similar` });
  return (data.results || []).slice(0, 8).map((r) => ({
    id: r.id,
    title: r.title || r.name,
    cover_url: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : null,
    release_year: (r.release_date || r.first_air_date || "").slice(0, 4),
  }));
}

async function getGenres() {
  const [movieRes, tvRes] = await Promise.all([
    requestWithRetry({ method: "get", url: "/genre/movie/list" }),
    requestWithRetry({ method: "get", url: "/genre/tv/list" }),
  ]);

  // TMDB uses separate id spaces for movie vs tv genres, even when the
  // name is identical (e.g. "Action" vs "Action & Adventure"), so we key
  // by name and keep both ids where they exist.
  const byName = new Map();
  (movieRes.data.genres || []).forEach((g) => {
    byName.set(g.name, { name: g.name, movieId: g.id, tvId: null });
  });
  (tvRes.data.genres || []).forEach((g) => {
    const existing = byName.get(g.name);
    if (existing) existing.tvId = g.id;
    else byName.set(g.name, { name: g.name, movieId: null, tvId: g.id });
  });

  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeDiscoverResult(r, mediaType, genre) {
  return {
    id: r.id,
    mediaType,
    genre,
    title: r.title || r.name,
    posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
    year: (r.release_date || r.first_air_date || "").slice(0, 4),
    rating: Number((r.vote_average / 2).toFixed(1)), // matches your existing /5 scale
    popularity: r.popularity,
  };
}

// Pulls both a "top rated" and a "latest" slice per genre, for both movies
// and tv where the genre applies. vote_average.gte:8 on TMDB's /10 scale
// is ~4/5 in this app's rating scale.
async function discoverByGenres(genreNames) {
  const allGenres = await getGenres();
  const wanted = allGenres.filter((g) => genreNames.includes(g.name));

  const out = [];
  for (const g of wanted) {
    const items = [];

    for (const [mediaType, genreId] of [
      ["movie", g.movieId],
      ["tv", g.tvId],
    ]) {
      if (!genreId) continue;

      const [topRes, latestRes] = await Promise.all([
        requestWithRetry({
          method: "get",
          url: `/discover/${mediaType}`,
          params: {
            with_genres: genreId,
            sort_by: "vote_average.desc",
            "vote_count.gte": 200,
            "vote_average.gte": 8,
            include_adult: false,
          },
        }),
        requestWithRetry({
          method: "get",
          url: `/discover/${mediaType}`,
          params: {
            with_genres: genreId,
            sort_by: mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc",
            "vote_count.gte": 20,
            include_adult: false,
          },
        }),
      ]);

      items.push(
        ...(topRes.data.results || []).slice(0, 6).map((r) => ({
          ...normalizeDiscoverResult(r, mediaType, g.name),
          bucket: "top_rated",
        })),
        ...(latestRes.data.results || []).slice(0, 6).map((r) => ({
          ...normalizeDiscoverResult(r, mediaType, g.name),
          bucket: "latest",
        })),
      );
    }

    // de-dupe in case a title shows up in both buckets
    const seen = new Set();
    const deduped = items.filter((it) => {
      const key = `${it.mediaType}-${it.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    out.push({
      genre: g.name,
      topRated: deduped.filter((it) => it.bucket === "top_rated"),
      latest: deduped.filter((it) => it.bucket === "latest"),
    });
  }

  return out;
}

// Random pick across every selected genre's pool, restricted to
// well-rated + recent titles (same quality bar as the suggestion lists).
async function getSurprisePick(genreNames) {
  const suggestions = await discoverByGenres(genreNames);
  const pool = suggestions.flatMap((s) => [...s.topRated, ...s.latest]);

  if (pool.length === 0) return null;

  const seen = new Set();
  const uniquePool = pool.filter((it) => {
    const key = `${it.mediaType}-${it.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniquePool[Math.floor(Math.random() * uniquePool.length)];
}

// Poster art only, used for the watch-party landing page's background
// mosaic — trending/week gives a decent mix of recognizable movies + tv
// without needing a genre selection up front.
async function getTrendingPosters(limit = 30) {
  const { data } = await requestWithRetry({
    method: "get",
    url: "/trending/all/week",
  });

  return (data.results || [])
    .filter((r) => r.poster_path)
    .slice(0, limit)
    .map((r) => `https://image.tmdb.org/t/p/w300${r.poster_path}`);
}

module.exports = {
  searchTitle,
  getDetails,
  getCredits,
  getRatings,
  getReviews,
  getSimilar,
  getVideos,
  getGenres,
  discoverByGenres,
  getSurprisePick,
  getTrendingPosters,
};