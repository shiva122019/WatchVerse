const router = require("express").Router();
const User = require("../Models/User");
const activityService = require("../services/activity.js");
const AppError = require("../lib/AppError");

/**
 * GET /profile/:username/activity
 * Returns recent activity and activity timeline for a specified user.
 */
router.get("/:username/activity", async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.user._id);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const [recentActivity, activityTimeline] = await Promise.all([
      activityService.getRecentActivity(targetUser._id, 10),
      activityService.getActivityTimeline(targetUser._id, 50),
    ]);

    res.json({
      recentActivity,
      activityTimeline,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
