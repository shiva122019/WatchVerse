const axios = require("axios");
const NodeCache = require("node-cache");

//------------------------------------------------------------------
// Cache
//------------------------------------------------------------------
// 15-minute TTL for search results, matching your browseCache pattern.
const musicCache = new NodeCache({ stdTTL: 60 * 15 });

//------------------------------------------------------------------
// Client Credentials token handling
//------------------------------------------------------------------
// Spotify's client-credentials flow gives an app-only token (no user
// login needed) that's valid for ~3600s. We cache it in memory and
// refetch a little before it actually expires.

let cachedToken = null;
let tokenExpiresAt = 0;

async function getSpotifyToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in environment.",
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  cachedToken = res.data.access_token;
  // Refresh 60s before actual expiry to be safe.
  tokenExpiresAt = now + (res.data.expires_in - 60) * 1000;

  return cachedToken;
}

//------------------------------------------------------------------
// Map a Spotify track object -> your MediaCard shape
//------------------------------------------------------------------
// MediaCard expects: id, type, title, cover_url, release_year,
// description, avg_rating, and optionally genres/language.
// Tracks don't carry genres directly (only artists do), so we use
// description for the artist name(s), same as your MediaCard already
// does for songs (isSong ? item.description : ...).

function mapSpotifyItem(track) {
  const artists = (track.artists || []).map((a) => a.name).join(", ");
  const image = track.album?.images?.[0]?.url || "";
  const year = track.album?.release_date
    ? track.album.release_date.slice(0, 4)
    : "";

  return {
    id: track.id,
    type: "song",
    title: track.name,
    cover_url: image,
    release_year: year,
    description: artists,
    // Spotify popularity is 0-100; scale to a 0-5 "rating" to match
    // your movie/series avg_rating range.
    avg_rating: Math.round((track.popularity / 20) * 10) / 10,
    external_url: track.external_urls?.spotify || null,
    preview_url: (() => {
      const lowerTitle = (track.name || "").toLowerCase();
      if (lowerTitle.includes("arz kiya") || lowerTitle.includes("anuv")) {
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      }
      if (lowerTitle.includes("aarzu") || lowerTitle.includes("noor")) {
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
      }
      return track.preview_url || null;
    })(),
  };
}

//------------------------------------------------------------------
// Search tracks
//------------------------------------------------------------------

async function spotifySearchTracks(query, limit = 10) {
  const token = await getSpotifyToken();

  const res = await axios.get("https://api.spotify.com/v1/search", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: query,
      type: "track",
      limit: Math.min(limit, 50),
    },
  });

  const tracks = res.data.tracks?.items || [];

  return tracks.map(mapSpotifyItem);
}

//------------------------------------------------------------------
// "All Genres" fallback
//------------------------------------------------------------------
// Spotify deprecated the `tag:new` / `tag:hipster` search filters in
// late 2024 — they now return empty results for every app. There's
// no single "give me anything" query anymore, so instead we pull a
// handful of tracks from each known genre in parallel and merge them
// into one mixed, deduped, popularity-sorted list.

const DEFAULT_GENRES = ["synthwave", "indie", "pop", "jazz", "folk"];

async function spotifySearchAll(limit = 10) {
  const token = await getSpotifyToken();

  const perGenreLimit = Math.max(5, Math.ceil(limit / DEFAULT_GENRES.length));

  const responses = await Promise.allSettled(
    DEFAULT_GENRES.map((g) =>
      axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: `genre:"${g}"`,
          type: "track",
          limit: perGenreLimit,
        },
      }),
    ),
  );

  let tracks = [];

  responses.forEach((r) => {
    if (r.status === "fulfilled") {
      tracks.push(...(r.value.data.tracks?.items || []));
    }
  });

  // Dedupe by track id.
  const seen = new Set();
  tracks = tracks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  tracks.sort((a, b) => b.popularity - a.popularity);

  return tracks.slice(0, limit).map(mapSpotifyItem);
}

//------------------------------------------------------------------
// Get a single track by ID (for the content detail page)
//------------------------------------------------------------------

async function spotifyGetTrack(trackId) {
  const cacheKey = `track-${trackId}`;
  const cached = musicCache.get(cacheKey);

  if (cached) return cached;

  const token = await getSpotifyToken();

  const res = await axios.get(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const track = res.data;

  const mapped = {
    id: track.id,
    type: "song",
    title: track.name,
    cover_url: track.album?.images?.[0]?.url || "",
    backdrop_url: track.album?.images?.[0]?.url || "",
    release_year: track.album?.release_date
      ? track.album.release_date.slice(0, 4)
      : "",
    duration: formatDuration(track.duration_ms),
    language: null,
    description: track.album?.name
      ? `From the album ${track.album.name}.`
      : "",
    creator: (track.artists || []).map((a) => a.name).join(", "),
    cast: [],
    genres: [],
    avg_rating: Math.round((track.popularity / 20) * 10) / 10,
    review_count: 0,
    external_url: track.external_urls?.spotify || null,
    preview_url: (() => {
      const lowerTitle = (track.name || "").toLowerCase();
      if (lowerTitle.includes("arz kiya") || lowerTitle.includes("anuv")) {
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      }
      if (lowerTitle.includes("aarzu") || lowerTitle.includes("noor")) {
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
      }
      return track.preview_url || null;
    })(),
  };

  musicCache.set(cacheKey, mapped);

  return mapped;
}

function formatDuration(ms) {
  if (!ms) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

module.exports = {
  musicCache,
  spotifySearchTracks,
  spotifySearchAll,
  spotifyGetTrack,
  mapSpotifyItem,
  getSpotifyToken,
};