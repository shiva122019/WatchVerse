// services/spotify.service.js
const axios = require("axios");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = axios.create({
  baseURL: "https://api.spotify.com/v1",
  timeout: 8000,
});

let cachedToken = null;
let tokenExpiresAt = 0;

// Client Credentials flow — no user login needed, good for search-only use.
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
  }

  const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 8000,
    }
  );

  cachedToken = data.access_token;
  // Refresh a little early (60s buffer) to avoid edge-of-expiry failures
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

async function requestWithRetry(config, retries = 2) {
  try {
    const token = await getAccessToken();
    return await spotifyApi.request({
      ...config,
      headers: { ...(config.headers || {}), Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    // If token expired mid-flight (401), force a refresh once and retry
    if (err.response?.status === 401 && retries > 0) {
      cachedToken = null;
      return requestWithRetry(config, retries - 1);
    }
    if (retries > 0) return requestWithRetry(config, retries - 1);
    throw err;
  }
}

// Normalizes a raw Spotify track object into the shape the rest of the app expects.
function mapTrack(track) {
  return {
    deezerId: track.id, // kept field name "deezerId" for drop-in compatibility with controller
    artistId: track.artists?.[0]?.id,
    title: track.name,
    artist: (track.artists || []).map((a) => a.name).join(", "),
    album: track.album?.name || null,
    cover:
      track.album?.images?.[0]?.url ||
      track.album?.images?.[1]?.url ||
      null,
    previewUrl: track.preview_url || null, // Spotify often returns null here (deprecated for most apps)
    deezerUrl: track.external_urls?.spotify || null, // field name kept for compatibility; it's the Spotify URL
    durationMs: track.duration_ms || null,
    year: track.album?.release_date ? track.album.release_date.slice(0, 4) : null,
  };
}

async function searchTrack(query, limit = 5) {
  query = query
    .trim()
    .replace(/\bsong\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!query) return [];

  try {
    const { data } = await requestWithRetry({
      method: "get",
      url: "/search",
      params: {
        q: query,
        type: "track",
        limit,
      },
    });

    const items = data.tracks?.items || [];
    return items.map(mapTrack);
  } catch (e) {
    console.error("🔴 SPOTIFY SEARCH ERROR:", e.response?.status, e.response?.data || e.message);
    return [];
  }
}

async function getArtistTopTracks(artistId, market = "US") {
  if (!artistId) return [];
  try {
    const { data } = await requestWithRetry({
      method: "get",
      url: `/artists/${artistId}/top-tracks`,
      params: { market },
    });
    return (data.tracks || []).map(mapTrack);
  } catch (e) {
    console.error("🔴 SPOTIFY TOP TRACKS ERROR:", e.response?.status, e.response?.data || e.message);
    return [];
  }
}

module.exports = { searchTrack, getArtistTopTracks };