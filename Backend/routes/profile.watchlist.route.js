const router = require("express").Router();
const User = require("../Models/User");
const profileService = require("../services/profile.service");
const AppError = require("../lib/AppError");

/**
 * GET /profile/:username/watchlist
 * Returns user's watchlist grouped into wantToWatch, watching, watched.
 */
router.get("/:username/watchlist", async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.trim() });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const watchlist = await profileService.getWatchlist(targetUser._id);
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
