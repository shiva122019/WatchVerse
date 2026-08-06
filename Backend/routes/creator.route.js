const router = require("express").Router();
const creatorService = require("../services/creator.service");
const { isAuthenticated } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

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
 * POST /creator/posts
 * Create a new creator post. Restricted to users with role "creator".
 */
router.post(
  "/posts",
  isAuthenticated,
  requireRole("creator"),
  async (req, res, next) => {
    try {
      const post = await creatorService.createPost({
        userId: req.user._id,
        category: req.body.category,
        title: req.body.title,
        thumbUrl: req.body.thumbUrl,
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
  requireRole("creator"),
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
  requireRole("creator"),
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

module.exports = router;
