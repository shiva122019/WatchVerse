const router = require("express").Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const User = require("../Models/User");
const profileService = require("../services/profile.service");
const { isAuthenticated } = require("../middleware/auth");
const AppError = require("../lib/AppError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

/**
 * Upload buffer to Cloudinary
 */
function uploadToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
}

/**
 * GET /profile/me
 * Returns the current authenticated user's profile object.
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
 * POST /profile/banner
 * Upload a banner image to Cloudinary.
 */
router.post(
  "/banner",
  isAuthenticated,
  upload.single("banner"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError("Please upload a banner image.", 400);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        "watchverse/banners",
      );

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            bannerUrl: result.secure_url,
          },
        },
        {
          new: true,
        },
      );

      res.json({
        success: true,
        message: "Banner uploaded successfully.",
        bannerUrl: result.secure_url,
        profile: await profileService.buildProfile(user._id),
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /profile/:username
 * Returns any user's profile object by username.
 */
router.get("/:username", async (req, res, next) => {
  try {
    const targetUser = await User.findOne({
      username: req.params.username.trim(),
    });

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
 * Update current user's profile details.
 */
router.patch("/", isAuthenticated, async (req, res, next) => {
  try {
    const allowedFields = [
      "displayName",
      "bio",
      "location",
      "website",
      "bannerUrl",
      "avatar",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
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
