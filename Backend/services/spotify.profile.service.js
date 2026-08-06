const axios = require("axios");
const User = require("../Models/User");
const SpotifyConnection = require("../Models/SpotifyConnection");
const { getAccessTokenFromRefreshToken } = require("../lib/spotify");

// How long (in ms) before we consider the cached Spotify data stale.
// 1 hour — frequent enough to stay current, rare enough to avoid rate limits.
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Fetch and return the Spotify profile data for a WatchVerse user.
 *
 * Flow:
 *  1. Check SpotifyConnection cache — return if still fresh.
 *  2. Use stored refresh token to get a user-scoped access token.
 *  3. Fetch /me, /me/top/artists from Spotify API.
 *  4. Derive top genres from the top artists.
 *  5. Upsert into SpotifyConnection cache.
 *  6. Return the shape the frontend expects.
 *
 * @param {string} userId - WatchVerse user _id
 * @returns {Promise<{connected: boolean, username: string|null, followers: number, topArtists: string[], topGenres: string[]}>}
 */
async function getSpotifyProfile(userId) {
  const user = await User.findById(userId).lean();

  // User has no Spotify linked
  if (!user || !user.spotify?.connected || !user.spotify?.refreshToken) {
    return {
      connected: false,
      username: null,
      followers: 0,
      topArtists: [],
      topGenres: [],
    };
  }

  // Check cache first
  const cached = await SpotifyConnection.findOne({ userId }).lean();

  if (cached && cached.lastSyncedAt) {
    const age = Date.now() - new Date(cached.lastSyncedAt).getTime();
    if (age < CACHE_TTL_MS) {
      return {
        connected: true,
        username: cached.spotifyUsername,
        followers: cached.followers,
        topArtists: cached.topArtists,
        topGenres: cached.topGenres,
      };
    }
  }

  // Cache miss or stale — fetch fresh data from Spotify
  try {
    const accessToken = await getAccessTokenFromRefreshToken(
      user.spotify.refreshToken,
    );

    const [profileRes, artistsRes] = await Promise.all([
      axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 8000,
      }),
      axios.get("https://api.spotify.com/v1/me/top/artists", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: 10, time_range: "medium_term" },
        timeout: 8000,
      }),
    ]);

    const spotifyProfile = profileRes.data;
    const topArtistsRaw = artistsRes.data.items || [];

    const topArtists = topArtistsRaw.map((a) => a.name).slice(0, 6);

    // Derive top genres from the artists' genre arrays — pick the most common
    const genreCount = {};
    for (const artist of topArtistsRaw) {
      for (const genre of artist.genres || []) {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      }
    }
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre]) => capitalizeGenre(genre));

    const spotifyData = {
      spotifyUsername: spotifyProfile.display_name || spotifyProfile.id,
      followers: spotifyProfile.followers?.total || 0,
      topArtists,
      topGenres,
      lastSyncedAt: new Date(),
    };

    // Upsert cache
    await SpotifyConnection.findOneAndUpdate({ userId }, spotifyData, {
      upsert: true,
      new: true,
    });

    return {
      connected: true,
      username: spotifyData.spotifyUsername,
      followers: spotifyData.followers,
      topArtists: spotifyData.topArtists,
      topGenres: spotifyData.topGenres,
    };
  } catch (err) {
    console.error(
      "[SpotifyProfileService] Failed to fetch Spotify data:",
      err.response?.status || err.message,
    );

    // If we have stale cached data, return it rather than failing
    if (cached) {
      return {
        connected: true,
        username: cached.spotifyUsername,
        followers: cached.followers,
        topArtists: cached.topArtists,
        topGenres: cached.topGenres,
      };
    }

    // No cache, API failed — return disconnected-like response
    return {
      connected: true, // technically connected, just can't fetch data
      username: user.spotify.id || null,
      followers: 0,
      topArtists: [],
      topGenres: [],
    };
  }
}

/**
 * Capitalize each word of a Spotify genre string.
 * e.g. "film score" → "Film Score"
 */
function capitalizeGenre(genre) {
  return genre.replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = { getSpotifyProfile };
