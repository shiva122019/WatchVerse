const router = require("express").Router();
const User = require("../Models/User");
const profileService = require("../services/profile.service");
const AppError = require("../lib/AppError");

/**
 * GET /profile/:username/reviews
 * Returns paginated reviews for a user.
 */
router.get("/:username/reviews", async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.trim() });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await profileService.getReviewsPaginated(targetUser._id, {
      page,
      limit,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
