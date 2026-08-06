const axios = require("axios");
const rax = require("retry-axios");
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

const IMAGE_BASE = "https://image.tmdb.org/t/p";

// ----------------------------
// Search movies & TV shows
// ----------------------------
async function searchTitle(query) {
  const { data } = await tmdb.get("/search/multi", {
    params: {
      query,
      include_adult: false,
    },
  });

  return data.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv",
  );
}

// ----------------------------
// Get all genres
// ----------------------------
async function getGenres() {
  const [movieGenres, tvGenres] = await Promise.all([
    tmdb.get("/genre/movie/list"),
    tmdb.get("/genre/tv/list"),
  ]);

  const map = new Map();

  [...movieGenres.data.genres, ...tvGenres.data.genres].forEach((genre) => {
    map.set(genre.id, genre);
  });

  return [...map.values()];
}

// ----------------------------
// Discover by genres
// ----------------------------
async function discoverByGenres(genreNames) {
  const genres = await getGenres();

  const ids = genres
    .filter((g) => genreNames.includes(g.name))
    .map((g) => g.id);

  if (!ids.length) return [];

  const [movies, tv] = await Promise.all([
    tmdb.get("/discover/movie", {
      params: {
        with_genres: ids.join(","),
        sort_by: "vote_average.desc",
        "vote_count.gte": 200,
      },
    }),
    tmdb.get("/discover/tv", {
      params: {
        with_genres: ids.join(","),
        sort_by: "vote_average.desc",
        "vote_count.gte": 100,
      },
    }),
  ]);

  return [...movies.data.results, ...tv.data.results]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 30)
    .map((item) => ({
      id: item.id,
      mediaType: item.title ? "movie" : "tv",
      title: item.title || item.name,
      year: (item.release_date || item.first_air_date || "").slice(0, 4),
      rating: item.vote_average,
      posterUrl: item.poster_path
        ? `${IMAGE_BASE}/w342${item.poster_path}`
        : null,
      backdropUrl: item.backdrop_path
        ? `${IMAGE_BASE}/w780${item.backdrop_path}`
        : null,
      overview: item.overview,
    }));
}

// ----------------------------
// Surprise pick
// ----------------------------
async function getSurprisePick(genreNames) {
  const list = await discoverByGenres(genreNames);

  if (!list.length) return null;

  const candidates = list.slice(0, 20);

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ----------------------------
// Trending posters
// ----------------------------
async function getTrendingPosters(limit = 30) {
  const { data } = await tmdb.get("/trending/all/week");

  return data.results
    .filter((item) => item.poster_path)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      posterUrl: `${IMAGE_BASE}/w342${item.poster_path}`,
    }));
}

async function getVideo(mediaType, id) {
  if (!["movie", "tv"].includes(mediaType)) {
    throw new Error("Invalid media type");
  }

  const { data } = await tmdb.get(`/${mediaType}/${id}/videos`);

  const videos = data.results || [];

  // Prefer official YouTube trailers
  let video =
    videos.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
    ) ||
    // Then any YouTube trailer
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    // Then any official YouTube video
    videos.find((v) => v.site === "YouTube" && v.official) ||
    // Finally any YouTube video
    videos.find((v) => v.site === "YouTube");

  if (!video) {
    return null;
  }

  return {
    id: video.id,
    name: video.name,
    type: video.type,
    official: video.official,
    youtubeKey: video.key,
    url: `https://www.youtube.com/watch?v=${video.key}`,
    embedUrl: `https://www.youtube.com/embed/${video.key}`,
  };
}

module.exports = {
  searchTitle,
  getDetails,
  getCredits,
  getRatings,
  getReviews,
  getSimilar,
  searchTitle,
  getGenres,
  discoverByGenres,
  getSurprisePick,
  getTrendingPosters,
  getVideo,
};
