const router = require("express").Router();
const spotifyProfileService = require("../services/spotify.profile.service");
const { isAuthenticated } = require("../middleware/auth");

/**
 * GET /spotify/profile
 * Returns Spotify profile data (connected, username, followers, topArtists, topGenres) for current user.
 */
router.get("/profile", isAuthenticated, async (req, res, next) => {
  try {
    const spotifyData = await spotifyProfileService.getSpotifyProfile(req.user._id);
    res.json(spotifyData);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
