const router = require("express").Router();
const User = require("../Models/User");
const profileService = require("../services/profile.service");
const { isAuthenticated } = require("../middleware/auth");
const AppError = require("../lib/AppError");

/**
 * GET /profile/me
 * Returns the current authenticated user's profile object in full mockProfile shape.
 */
router.get("/me", isAuthenticated, async (req, res, next) => {
  try {
    const profile = await profileService.buildProfile(req.user._id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /profile/:username
 * Returns any user's profile object by username.
 */
router.get("/:username", async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.trim() });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const profile = await profileService.buildProfile(targetUser._id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /profile
 * Update current user's profile details (displayName, bio, location, website, bannerUrl, avatar).
 */
router.patch("/", isAuthenticated, async (req, res, next) => {
  try {
    const allowedFields = ["displayName", "bio", "location", "website", "bannerUrl", "avatar"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    const profile = await profileService.buildProfile(updatedUser._id);
    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
