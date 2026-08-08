const router = require("express").Router();
const creatorService = require("../services/creator.service");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /creator/posts
 * Fetch all creator posts for the authenticated creator user.
 */
router.get("/posts", isAuthenticated, async (req, res, next) => {
  try {
    const posts = await creatorService.getCreatorPosts(req.user._id);
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /creator/stats
 * Fetch total views, watch time, and post count.
 */
router.get("/stats", isAuthenticated, async (req, res, next) => {
  try {
    const stats = await creatorService.getCreatorStats(req.user._id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /creator/posts
 * Create a new creator post. Restricted to users with role "creator".
 */
router.post(
  "/posts",
  isAuthenticated,
  upload.fields([
    { name: "thumb", maxCount: 1 },
    { name: "media", maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      let thumbUrl = req.body.thumbUrl || null;
      let videoUrl = req.body.videoUrl || null;
      let audioUrl = req.body.audioUrl || null;

      // Helper function to upload buffer to Cloudinary
      const uploadToCloudinary = (buffer, resourceType) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, folder: "watchverse_creator" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      };

      if (req.files) {
        if (req.files.thumb && req.files.thumb[0]) {
          const result = await uploadToCloudinary(req.files.thumb[0].buffer, "image");
          thumbUrl = result.secure_url;
        }

        if (req.files.media && req.files.media[0]) {
          // Cloudinary uses "video" resource_type for both video and audio
          const result = await uploadToCloudinary(req.files.media[0].buffer, "video");
          if (req.body.type === "movie") {
            videoUrl = result.secure_url;
          } else {
            audioUrl = result.secure_url;
          }
        }
      }

      // If category is sent as a comma-separated string from FormData, split it
      let categoryArray = [];
      if (req.body.category) {
        try {
          // If the frontend sends an array, it might be stringified or just multiple values
          categoryArray = Array.isArray(req.body.category) 
            ? req.body.category 
            : typeof req.body.category === 'string' 
              ? req.body.category.split(',') 
              : [];
        } catch(e) {
          categoryArray = [];
        }
      }

      const post = await creatorService.createPost({
        userId: req.user._id,
        type: req.body.type,
        format: req.body.format,
        category: categoryArray,
        title: req.body.title,
        thumbUrl,
        videoUrl,
        audioUrl,
        duration: req.body.duration ? Number(req.body.duration) : 0,
      });

      res.status(201).json({
        success: true,
        message: "Creator post created successfully",
        post,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PATCH /creator/posts/:id
 * Edit an existing creator post. Restricted to creator role and author.
 */
router.patch(
  "/posts/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const updatedPost = await creatorService.updatePost(
        req.params.id,
        req.user._id,
        req.body,
      );

      res.json({
        success: true,
        message: "Creator post updated successfully",
        post: updatedPost,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /creator/posts/:id
 * Delete a creator post. Restricted to creator role and author.
 */
router.delete(
  "/posts/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      await creatorService.deletePost(req.params.id, req.user._id);

      res.json({
        success: true,
        message: "Creator post deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /creator/feed
 * Fetch recent creator posts across all users (for public consumption)
 */
router.get("/feed", async (req, res, next) => {
  try {
    const posts = await creatorService.CreatorPost.find()
      .populate("userId", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      posts,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /creator/posts/:id
 * Fetch a single creator post by ID
 */
router.get("/posts/:id", async (req, res, next) => {
  try {
    const post = await creatorService.CreatorPost.findById(req.params.id)
      .populate("userId", "username profilePic")
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    res.json({
      success: true,
      post,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /creator/posts/:id/view
 * Increment view count and watch time
 */
router.post("/posts/:id/view", async (req, res, next) => {
  try {
    const watchTime = req.body.watchTime ? Number(req.body.watchTime) : 0;
    
    // Extract viewer identifier for unique viewers metric
    const viewerId = req.ip || req.headers['x-forwarded-for'] || "unknown";
    
    const post = await creatorService.incrementView(req.params.id, watchTime, viewerId);
    
    res.json({
      success: true,
      message: "View recorded",
      views: post.views,
      watchTime: post.watchTime
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
