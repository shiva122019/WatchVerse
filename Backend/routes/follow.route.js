const router = require("express").Router();
const User = require("../Models/User");
const Follow = require("../Models/Follow");
const activityService = require("../services/activity.service");
const { isAuthenticated } = require("../middleware/auth");
const AppError = require("../lib/AppError");

/**
 * POST /follow/:username
 * Follow a user by username.
 */
router.post("/:username", isAuthenticated, async (req, res, next) => {
  try {
    const targetUsername = req.params.username.trim();
    if (targetUsername === req.user.username) {
      throw new AppError("You cannot follow yourself", 400);
    }

    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new AppError("User to follow not found", 404);
    }

    const follow = await Follow.findOneAndUpdate(
      {
        follower: req.user._id,
        following: targetUser._id,
      },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Log follow activity asynchronously
    activityService
      .logActivity({
        userId: req.user._id,
        type: "follow",
        title: targetUser.username,
        targetUser: targetUser.username,
        targetId: targetUser._id.toString(),
      })
      .catch((err) => console.error("Follow activity log failed:", err.message));

    res.status(201).json({
      success: true,
      message: `You are now following ${targetUser.username}`,
      follow,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /follow/:username
 * Unfollow a user by username.
 */
router.delete("/:username", isAuthenticated, async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.trim() });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const result = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: targetUser._id,
    });

    if (!result) {
      throw new AppError("You are not following this user", 400);
    }

    res.json({
      success: true,
      message: `Unfollowed ${targetUser.username}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /followers/:username
 * Get list of users following the specified user.
 */
router.get("/followers/:username", async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.trim() });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const follows = await Follow.find({ following: targetUser._id })
      .populate("follower", "username displayName avatar role verified")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      followers: follows.map((f) => f.follower),
      count: follows.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /following/:username
 * Get list of users that the specified user is following.
 */
router.get("/following/:username", async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.trim() });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const follows = await Follow.find({ follower: targetUser._id })
      .populate("following", "username displayName avatar role verified")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      following: follows.map((f) => f.following),
      count: follows.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
