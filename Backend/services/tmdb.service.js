// // const axios = require("axios");
// // const rax = require("retry-axios");
// // const https = require("https");

// // // Reuse TCP/TLS connections instead of opening a new one per request.
// // // This alone fixes most ECONNRESET issues under Windows/dev environments.
// // const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 20 });

// // const tmdb = axios.create({
// //   baseURL: "https://api.themoviedb.org/3",
// //   headers: {
// //     accept: "application/json",
// //     Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
// //   },
// //   timeout: 10000,
// //   httpsAgent: keepAliveAgent,
// //   // retry-axios config attached to every request on this instance
// //   raxConfig: {
// //     instance: null, // filled in below after attach
// //     retry: 3,
// //     retryDelay: 300,
// //     backoffType: "linear", // 300 ms, 600 ms, 900 ms
// //     // Retry only on transient network errors and server errors (not 4xx)
// //     httpMethodsToRetry: ["GET", "POST", "PUT", "DELETE"],
// //     statusCodesToRetry: [[500, 599]],
// //     onRetryAttempt: (err) => {
// //       const cfg = rax.getConfig(err);
// //       console.warn(
// //         `[TMDB] Retry attempt #${cfg.currentRetryAttempt} – ${err.code || err.message}`,
// //       );
// //     },
// //   },
// // });

// // // Attach the interceptor and wire the instance back into raxConfig
// // const interceptorId = rax.attach(tmdb);
// // tmdb.defaults.raxConfig.instance = tmdb;

// // async function searchTitle(query) {
// //   const { data } = await tmdb.get("/search/multi", {
// //     params: { query, include_adult: false },
// //   });

// //   return (data.results || []).filter(
// //     (r) => r.media_type === "movie" || r.media_type === "tv",
// //   );
// // }

// // async function getDetails(tmdbId, mediaType) {
// //   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}`);
// //   return data;
// // }

// // async function getCredits(tmdbId, mediaType) {
// //   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/credits`);

// //   return {
// //     cast: (data.cast || []).slice(0, 12).map((c) => ({
// //       name: c.name,
// //       character: c.character,
// //       profile_path: c.profile_path
// //         ? `https://image.tmdb.org/t/p/w200${c.profile_path}`
// //         : null,
// //     })),
// //     crew: (data.crew || [])
// //       .filter((c) => ["Director", "Writer", "Creator"].includes(c.job))
// //       .map((c) => ({ name: c.name, job: c.job })),
// //   };
// // }

// // async function getRatings(tmdbId, mediaType) {
// //   const data = await getDetails(tmdbId, mediaType);
// //   return {
// //     tmdb_score: Number((data.vote_average / 2).toFixed(1)),
// //     vote_count: data.vote_count,
// //     popularity: data.popularity,
// //   };
// // }

// // async function getReviews(tmdbId, mediaType) {
// //   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/reviews`);
// //   return (data.results || []).slice(0, 5).map((r) => ({
// //     author: r.author,
// //     content: r.content,
// //     rating: r.author_details?.rating || null,
// //   }));
// // }

// // async function getSimilar(tmdbId, mediaType) {
// //   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/similar`);
// //   return (data.results || []).slice(0, 8).map((r) => ({
// //     tmdbId: r.id,
// //     mediaType: r.media_type || mediaType,
// //     title: r.title || r.name,
// //     poster: r.poster_path
// //       ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
// //       : null,
// //     year: (r.release_date || r.first_air_date || "").slice(0, 4),
// //     overview: r.overview,
// //   }));
// // }

// // module.exports = {
// //   searchTitle,
// //   getDetails,
// //   getCredits,
// //   getRatings,
// //   getReviews,
// //   getSimilar,
// // };

// const axios = require("axios");
// const rax = require("retry-axios");
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
//   // retry-axios config attached to every request on this instance
//   raxConfig: {
//     instance: null, // filled in below after attach
//     retry: 3,
//     retryDelay: 300,
//     backoffType: "linear", // 300 ms, 600 ms, 900 ms
//     // Retry only on transient network errors and server errors (not 4xx)
//     httpMethodsToRetry: ["GET", "POST", "PUT", "DELETE"],
//     statusCodesToRetry: [[500, 599]],
//     onRetryAttempt: (err) => {
//       const cfg = rax.getConfig(err);
//       console.warn(
//         `[TMDB] Retry attempt #${cfg.currentRetryAttempt} – ${err.code || err.message}`,
//       );
//     },
//   },
// });

// // Attach the interceptor and wire the instance back into raxConfig
// const interceptorId = rax.attach(tmdb);
// tmdb.defaults.raxConfig.instance = tmdb;

// async function searchTitle(query) {
//   const { data } = await tmdb.get("/search/multi", {
//     params: { query, include_adult: false },
//   });

//   return (data.results || []).filter(
//     (r) => r.media_type === "movie" || r.media_type === "tv",
//   );
// }

// async function getDetails(tmdbId, mediaType) {
//   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}`);
//   return data;
// }

// async function getCredits(tmdbId, mediaType) {
//   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/credits`);

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
//   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/reviews`);
//   return (data.results || []).slice(0, 5).map((r) => ({
//     author: r.author,
//     content: r.content,
//     rating: r.author_details?.rating || null,
//   }));
// }

// async function getSimilar(tmdbId, mediaType) {
//   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/similar`);
//   return (data.results || []).slice(0, 8).map((r) => ({
//     tmdbId: r.id,
//     mediaType: r.media_type || mediaType,
//     title: r.title || r.name,
//     poster: r.poster_path
//       ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
//       : null,
//     year: (r.release_date || r.first_air_date || "").slice(0, 4),
//     overview: r.overview,
//   }));
// }

// // --- Genre-name <-> TMDB genre-id caching -----------------------------
// // TMDB genre IDs differ between /movie and /tv, so we fetch and cache
// // both lists once, then look names up against whichever list applies.
// let genreCache = null; // { movie: [{id,name}], tv: [{id,name}], timestamp }
// const GENRE_CACHE_TTL = 60 * 60 * 1000; // 1 hour — genre lists barely change

// async function fetchGenreLists() {
//   if (genreCache && Date.now() - genreCache.timestamp < GENRE_CACHE_TTL) {
//     return genreCache;
//   }
//   const [movieRes, tvRes] = await Promise.all([
//     tmdb.get("/genre/movie/list"),
//     tmdb.get("/genre/tv/list"),
//   ]);
//   genreCache = {
//     movie: movieRes.data.genres || [],
//     tv: tvRes.data.genres || [],
//     timestamp: Date.now(),
//   };
//   return genreCache;
// }

// // GET /watchparty/genres — router does genres.map(g => g.name), so this
// // just needs to return objects with a .name field (movie + tv, deduped).
// async function getGenres() {
//   const { movie, tv } = await fetchGenreLists();
//   const seen = new Map();
//   [...movie, ...tv].forEach((g) => {
//     if (!seen.has(g.name)) seen.set(g.name, g);
//   });
//   return Array.from(seen.values());
// }

// function toRating5(voteAverage) {
//   // Same /5 convention already used in getRatings() above.
//   return Number(((voteAverage || 0) / 2).toFixed(1));
// }

// function mapDiscoverItem(r, mediaType, genreName) {
//   return {
//     id: r.id,
//     mediaType,
//     title: r.title || r.name,
//     year: (r.release_date || r.first_air_date || "").slice(0, 4),
//     posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
//     rating: toRating5(r.vote_average),
//     popularity: r.popularity,
//     genre: genreName,
//   };
// }

// // One genre -> { genre, topRated: [...], latest: [...] }, pulling from
// // both /discover/movie and /discover/tv (skipping whichever media type
// // doesn't have a matching genre id for this name).
// async function discoverGenre(genreName) {
//   const { movie, tv } = await fetchGenreLists();
//   const movieGenre = movie.find((g) => g.name === genreName);
//   const tvGenre = tv.find((g) => g.name === genreName);
//   const today = new Date().toISOString().slice(0, 10);

//   const topRatedPromises = [];
//   const latestPromises = [];

//   if (movieGenre) {
//     topRatedPromises.push(
//       tmdb
//         .get("/discover/movie", {
//           params: {
//             with_genres: movieGenre.id,
//             sort_by: "vote_average.desc",
//             "vote_count.gte": 200,
//           },
//         })
//         .then((res) =>
//           (res.data.results || []).slice(0, 8).map((r) => mapDiscoverItem(r, "movie", genreName)),
//         ),
//     );
//     latestPromises.push(
//       tmdb
//         .get("/discover/movie", {
//           params: {
//             with_genres: movieGenre.id,
//             sort_by: "primary_release_date.desc",
//             "vote_count.gte": 20,
//             "primary_release_date.lte": today,
//           },
//         })
//         .then((res) =>
//           (res.data.results || []).slice(0, 8).map((r) => mapDiscoverItem(r, "movie", genreName)),
//         ),
//     );
//   }

//   if (tvGenre) {
//     topRatedPromises.push(
//       tmdb
//         .get("/discover/tv", {
//           params: {
//             with_genres: tvGenre.id,
//             sort_by: "vote_average.desc",
//             "vote_count.gte": 100,
//           },
//         })
//         .then((res) =>
//           (res.data.results || []).slice(0, 8).map((r) => mapDiscoverItem(r, "tv", genreName)),
//         ),
//     );
//     latestPromises.push(
//       tmdb
//         .get("/discover/tv", {
//           params: {
//             with_genres: tvGenre.id,
//             sort_by: "first_air_date.desc",
//             "vote_count.gte": 10,
//             "first_air_date.lte": today,
//           },
//         })
//         .then((res) =>
//           (res.data.results || []).slice(0, 8).map((r) => mapDiscoverItem(r, "tv", genreName)),
//         ),
//     );
//   }

//   const [topRatedLists, latestLists] = await Promise.all([
//     Promise.all(topRatedPromises),
//     Promise.all(latestPromises),
//   ]);

//   return {
//     genre: genreName,
//     topRated: topRatedLists.flat(),
//     latest: latestLists.flat(),
//   };
// }

// // Finds a YouTube trailer (falling back to a teaser) for a title.
// async function getTrailerKey(tmdbId, mediaType) {
//   const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/videos`);
//   const vids = data.results || [];
//   const trailer =
//     vids.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
//     vids.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
//     vids.find((v) => v.site === "YouTube" && v.type === "Teaser");
//   return trailer ? trailer.key : null;
// }

// // GET /watchparty/suggestions — one group per requested genre.
// async function discoverByGenres(genreNames) {
//   const groups = await Promise.all(genreNames.map((g) => discoverGenre(g)));
//   return groups.filter((g) => g.topRated.length > 0 || g.latest.length > 0);
// }

// // GET /watchparty/surprise — random pick from the combined, reasonably-
// // rated pool across the given genres. Falls back to the full pool if
// // nothing clears the rating bar, so it still returns something rather
// // than 404-ing on a niche genre combo.
// async function getSurprisePick(genreNames) {
//   const groups = await discoverByGenres(genreNames);
//   const pool = groups.flatMap((g) => [...g.topRated, ...g.latest]);
//   if (pool.length === 0) return null;

//   const wellRated = pool.filter((item) => item.rating >= 3);
//   const candidates = wellRated.length > 0 ? wellRated : pool;
//   return candidates[Math.floor(Math.random() * candidates.length)];
// }

// // GET /watchparty/posters — flat list of poster image URLs for the
// // landing-page mosaic.
// async function getTrendingPosters(count = 30) {
//   const { data } = await tmdb.get("/trending/all/week");
//   return (data.results || [])
//     .filter((r) => r.poster_path)
//     .slice(0, count)
//     .map((r) => `https://image.tmdb.org/t/p/w500${r.poster_path}`);
// }

// module.exports = {
//   searchTitle,
//   getDetails,
//   getCredits,
//   getRatings,
//   getReviews,
//   getSimilar,
//   getGenres,
//   discoverByGenres,
//   getSurprisePick,
//   getTrendingPosters,
//   getTrailerKey,
// };

const axios = require("axios");
const rax = require("retry-axios");
const https = require("https");

// Reuse TCP/TLS connections instead of opening a new one per request.
// keepAliveMsecs recycles idle sockets before TMDB's server-side idle
// timeout can close them out from under us — this is what was causing
// the ECONNRESET retries.
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 4000,
  maxSockets: 20,
});

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
  timeout: 10000,
  httpsAgent: keepAliveAgent,
  // retry-axios config attached to every request on this instance
  raxConfig: {
    instance: null, // filled in below after attach
    retry: 3,
    retryDelay: 300,
    backoffType: "linear", // 300 ms, 600 ms, 900 ms
    // Retry only on transient network errors and server errors (not 4xx)
    httpMethodsToRetry: ["GET", "POST", "PUT", "DELETE"],
    statusCodesToRetry: [[500, 599]],
    onRetryAttempt: (err) => {
      const cfg = rax.getConfig(err);
      console.warn(
        `[TMDB] Retry attempt #${cfg.currentRetryAttempt} – ${err.code || err.message}`,
      );
    },
  },
});

// Attach the interceptor and wire the instance back into raxConfig
const interceptorId = rax.attach(tmdb);
tmdb.defaults.raxConfig.instance = tmdb;

async function searchTitle(query) {
  const { data } = await tmdb.get("/search/multi", {
    params: { query, include_adult: false },
  });

  return (data.results || []).filter(
    (r) => r.media_type === "movie" || r.media_type === "tv",
  );
}

async function getDetails(tmdbId, mediaType) {
  const { data } = await tmdb.get(`/${mediaType}/${tmdbId}`);
  return data;
}

async function getCredits(tmdbId, mediaType) {
  const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/credits`);

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
  const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/reviews`);
  return (data.results || []).slice(0, 5).map((r) => ({
    author: r.author,
    content: r.content,
    rating: r.author_details?.rating || null,
  }));
}

async function getSimilar(tmdbId, mediaType) {
  const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/similar`);
  return (data.results || []).slice(0, 8).map((r) => ({
    tmdbId: r.id,
    mediaType: r.media_type || mediaType,
    title: r.title || r.name,
    poster: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : null,
    year: (r.release_date || r.first_air_date || "").slice(0, 4),
    overview: r.overview,
  }));
}

// --- Genre-name <-> TMDB genre-id caching -----------------------------
// TMDB genre IDs differ between /movie and /tv, so we fetch and cache
// both lists once, then look names up against whichever list applies.
let genreCache = null; // { movie: [{id,name}], tv: [{id,name}], timestamp }
const GENRE_CACHE_TTL = 60 * 60 * 1000; // 1 hour — genre lists barely change

async function fetchGenreLists() {
  if (genreCache && Date.now() - genreCache.timestamp < GENRE_CACHE_TTL) {
    return genreCache;
  }
  const [movieRes, tvRes] = await Promise.all([
    tmdb.get("/genre/movie/list"),
    tmdb.get("/genre/tv/list"),
  ]);
  genreCache = {
    movie: movieRes.data.genres || [],
    tv: tvRes.data.genres || [],
    timestamp: Date.now(),
  };
  return genreCache;
}

// GET /watchparty/genres — router does genres.map(g => g.name), so this
// just needs to return objects with a .name field (movie + tv, deduped).
async function getGenres() {
  const { movie, tv } = await fetchGenreLists();
  const seen = new Map();
  [...movie, ...tv].forEach((g) => {
    if (!seen.has(g.name)) seen.set(g.name, g);
  });
  return Array.from(seen.values());
}

function toRating5(voteAverage) {
  // Same /5 convention already used in getRatings() above.
  return Number(((voteAverage || 0) / 2).toFixed(1));
}

function mapDiscoverItem(r, mediaType, genreName) {
  return {
    id: r.id,
    mediaType,
    title: r.title || r.name,
    year: (r.release_date || r.first_air_date || "").slice(0, 4),
    posterUrl: r.poster_path
      ? `https://image.tmdb.org/t/p/w342${r.poster_path}`
      : null,
    rating: toRating5(r.vote_average),
    popularity: r.popularity,
    genre: genreName,
  };
}

// One genre -> { genre, topRated: [...], latest: [...] }, pulling from
// both /discover/movie and /discover/tv (skipping whichever media type
// doesn't have a matching genre id for this name).
async function discoverGenre(genreName) {
  const { movie, tv } = await fetchGenreLists();
  const movieGenre = movie.find((g) => g.name === genreName);
  const tvGenre = tv.find((g) => g.name === genreName);
  const today = new Date().toISOString().slice(0, 10);

  const topRatedPromises = [];
  const latestPromises = [];

  if (movieGenre) {
    topRatedPromises.push(
      tmdb
        .get("/discover/movie", {
          params: {
            with_genres: movieGenre.id,
            sort_by: "vote_average.desc",
            "vote_count.gte": 200,
          },
        })
        .then((res) =>
          (res.data.results || [])
            .slice(0, 8)
            .map((r) => mapDiscoverItem(r, "movie", genreName)),
        ),
    );
    latestPromises.push(
      tmdb
        .get("/discover/movie", {
          params: {
            with_genres: movieGenre.id,
            sort_by: "primary_release_date.desc",
            "vote_count.gte": 20,
            "primary_release_date.lte": today,
          },
        })
        .then((res) =>
          (res.data.results || [])
            .slice(0, 8)
            .map((r) => mapDiscoverItem(r, "movie", genreName)),
        ),
    );
  }

  if (tvGenre) {
    topRatedPromises.push(
      tmdb
        .get("/discover/tv", {
          params: {
            with_genres: tvGenre.id,
            sort_by: "vote_average.desc",
            "vote_count.gte": 100,
          },
        })
        .then((res) =>
          (res.data.results || [])
            .slice(0, 8)
            .map((r) => mapDiscoverItem(r, "tv", genreName)),
        ),
    );
    latestPromises.push(
      tmdb
        .get("/discover/tv", {
          params: {
            with_genres: tvGenre.id,
            sort_by: "first_air_date.desc",
            "vote_count.gte": 10,
            "first_air_date.lte": today,
          },
        })
        .then((res) =>
          (res.data.results || [])
            .slice(0, 8)
            .map((r) => mapDiscoverItem(r, "tv", genreName)),
        ),
    );
  }

  const [topRatedLists, latestLists] = await Promise.all([
    Promise.all(topRatedPromises),
    Promise.all(latestPromises),
  ]);

  return {
    genre: genreName,
    topRated: topRatedLists.flat(),
    latest: latestLists.flat(),
  };
}

// Finds a YouTube trailer (falling back to a teaser) for a title.
async function getTrailerKey(tmdbId, mediaType) {
  const { data } = await tmdb.get(`/${mediaType}/${tmdbId}/videos`);
  const vids = data.results || [];
  const trailer =
    vids.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
    ) ||
    vids.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    vids.find((v) => v.site === "YouTube" && v.type === "Teaser");
  return trailer ? trailer.key : null;
}

// GET /watchparty/suggestions — one group per requested genre.
async function discoverByGenres(genreNames) {
  const groups = await Promise.all(genreNames.map((g) => discoverGenre(g)));
  return groups.filter((g) => g.topRated.length > 0 || g.latest.length > 0);
}

// GET /watchparty/surprise — random pick from the combined, reasonably-
// rated pool across the given genres. Falls back to the full pool if
// nothing clears the rating bar, so it still returns something rather
// than 404-ing on a niche genre combo.
async function getSurprisePick(genreNames) {
  const groups = await discoverByGenres(genreNames);
  const pool = groups.flatMap((g) => [...g.topRated, ...g.latest]);
  if (pool.length === 0) return null;

  const wellRated = pool.filter((item) => item.rating >= 3);
  const candidates = wellRated.length > 0 ? wellRated : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// GET /watchparty/posters — flat list of poster image URLs for the
// landing-page mosaic.
async function getTrendingPosters(count = 30) {
  const { data } = await tmdb.get("/trending/all/week");
  return (data.results || [])
    .filter((r) => r.poster_path)
    .slice(0, count)
    .map((r) => `https://image.tmdb.org/t/p/w500${r.poster_path}`);
}

module.exports = {
  searchTitle,
  getDetails,
  getCredits,
  getRatings,
  getReviews,
  getSimilar,
  getGenres,
  discoverByGenres,
  getSurprisePick,
  getTrendingPosters,
  getTrailerKey,
};
