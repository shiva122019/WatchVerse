// routes/spotify.personalization.route.js
const router = require("express").Router();
const NodeCache = require("node-cache");
const { getSpotifyPersonalizedRecs } = require("../services/spotifyPersonalization.service");

// Cache results for 30 minutes per user to avoid hammering Spotify + Gemini
const personalCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });

/**
 * GET /spotify/personalized
 * Returns personalized movie + music recommendations based on user's Spotify history.
 * Requires authentication and spotify.connected = true.
 */
router.get("/personalized", async (req, res) => {
  // Must be logged in
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Must have Spotify connected
  if (!req.user.spotify?.connected || !req.user.spotify?.refreshToken) {
    return res.status(403).json({ error: "Spotify not connected" });
  }

  const userId = req.user._id.toString();
  const cacheKey = `spotify-recs-${userId}`;

  // Return cached result if available
  const cached = personalCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, fromCache: true });
  }

  try {
    const recs = await getSpotifyPersonalizedRecs(req.user);
    personalCache.set(cacheKey, recs);
    return res.json(recs);
  } catch (err) {
    console.error("🔴 Spotify personalization error:", err.message);
    return res.status(500).json({ error: "Failed to generate personalized recommendations" });
  }
});

module.exports = router;
