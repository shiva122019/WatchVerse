// services/spotify.service.js
const axios = require("axios");
const rax = require("retry-axios");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = axios.create({
  baseURL: "https://api.spotify.com/v1",
  timeout: 8000,
  // retry-axios: retry up to 3 times on transient network/server errors
  raxConfig: {
    instance: null, // filled in below
    retry: 3,
    retryDelay: 300,
    backoffType: "linear",
    httpMethodsToRetry: ["GET", "POST"],
    statusCodesToRetry: [[500, 599, 400]],
    onRetryAttempt: (err) => {
      const cfg = rax.getConfig(err);
      console.warn(
        `[Spotify] Retry attempt #${cfg.currentRetryAttempt} – ${err.code || err.message}`,
      );
    },
  },
});

rax.attach(spotifyApi);
spotifyApi.defaults.raxConfig.instance = spotifyApi;

let cachedToken = null;
let tokenExpiresAt = 0;

// Client Credentials flow — no user login needed, good for search-only use.
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error(
      "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env",
    );
  }

  const basicAuth = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 8000,
    },
  );

  cachedToken = data.access_token;
  // Refresh a little early (60s buffer) to avoid edge-of-expiry failures
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

// Attach a response interceptor to handle 401 token expiry mid-flight.
// retry-axios handles 5xx/network errors; this interceptor handles auth refresh.
let isRefreshing = false;
spotifyApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._tokenRefreshed) {
      err.config._tokenRefreshed = true; // prevent infinite loop
      cachedToken = null;
      const newToken = await getAccessToken();
      err.config.headers["Authorization"] = `Bearer ${newToken}`;
      return spotifyApi.request(err.config);
    }
    return Promise.reject(err);
  },
);

// Inject the current access token before every request.
spotifyApi.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Normalizes a raw Spotify track object into the shape the rest of the app expects.
function mapTrack(track) {
  return {
    id: track.id,
    type: "song",

    title: track.name,

    artist: (track.artists || []).map((artist) => artist.name).join(", "),

    artistId: track.artists?.[0]?.id || null,

    album: track.album?.name || null,

    cover:
      track.album?.images?.[0]?.url ||
      track.album?.images?.[1]?.url ||
      track.album?.images?.[2]?.url ||
      null,

    image:
      track.album?.images?.[0]?.url ||
      track.album?.images?.[1]?.url ||
      track.album?.images?.[2]?.url ||
      null,

    poster:
      track.album?.images?.[0]?.url ||
      track.album?.images?.[1]?.url ||
      track.album?.images?.[2]?.url ||
      null,

    year: track.album?.release_date
      ? track.album.release_date.slice(0, 4)
      : null,

    durationMs: track.duration_ms || null,

    previewUrl: track.preview_url || null,

    spotifyUrl: track.external_urls?.spotify || null,

    // Temporary compatibility with old code
    deezerId: track.id,
    deezerUrl: track.external_urls?.spotify || null,
  };
}
const MAX_SPOTIFY_LIMIT = 10; // this app's access tier rejects limit > 10 on /search

async function spotifySearchTracks(query, limit = 20, offset = 0) {
  try {
    const { data } = await spotifyApi.get("/search", {
      params: { q: query, type: "track", limit, offset },
    });
    return (data.tracks?.items || []).map(mapTrack);
  } catch (e) {
    console.error(
      "🔴 SPOTIFY SEARCH ERROR:",
      query,
      limit,
      offset,
      e.response?.status,
      e.response?.data || e.message,
    );
    throw e;
  }
}

// Fetches up to `total` tracks by making sequential limit=10 requests,
// since single requests above that limit get rejected.
async function spotifySearchTracksBatch(query, total = 50, startOffset = 0) {
  const results = [];
  let offset = startOffset;

  while (results.length < total) {
    const batch = await spotifySearchTracks(query, MAX_SPOTIFY_LIMIT, offset);

    if (batch.length === 0) break; // no more matches from Spotify

    results.push(...batch);
    offset += MAX_SPOTIFY_LIMIT;

    if (batch.length < MAX_SPOTIFY_LIMIT) break; // partial page = end of results
  }

  return results.slice(0, total);
}
async function searchTrack(query, limit = 5) {
  query = query
    .trim()
    .replace(/\bsong\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!query) return [];

  try {
    const { data } = await spotifyApi.get("/search", {
      params: { q: query, type: "track", limit },
    });

    const items = data.tracks?.items || [];
    return items.map(mapTrack);
  } catch (e) {
    console.error(
      "🔴 SPOTIFY SEARCH ERROR:",
      e.response?.status,
      e.response?.data || e.message,
    );
    return [];
  }
}

async function getArtistTopTracks(artistId, market = "US") {
  if (!artistId) return [];
  try {
    const { data } = await spotifyApi.get(`/artists/${artistId}/top-tracks`, {
      params: { market },
    });
    return (data.tracks || []).map(mapTrack);
  } catch (e) {
    console.error(
      "🔴 SPOTIFY TOP TRACKS ERROR:",
      e.response?.status,
      e.response?.data || e.message,
    );
    return [];
  }
}

module.exports = {
  searchTrack,
  getArtistTopTracks,
  spotifySearchTracks,
  spotifySearchTracksBatch,
};
