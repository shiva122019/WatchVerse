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

module.exports = {
  searchTitle,
  getDetails,
  getCredits,
  getRatings,
  getReviews,
  getSimilar,
};