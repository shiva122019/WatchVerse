const router = require("express").Router();
const Comment = require("../Models/Comment.js");
const Review = require("../Models/Review.js");

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatComment(comment) {
  return {
    id: comment._id,
    content_id: comment.tmdbId,
    parent_id: comment.parentId || null,
    user_id: comment.userId._id || comment.userId,
    username: comment.userId.username || null,
    text: comment.isDeleted ? "[deleted]" : comment.text,
    is_deleted: comment.isDeleted,
    created_at: comment.createdAt,
    updated_at: comment.updatedAt,
  };
}

// ─── GET /comments?content_id=<id> ────────────────────────────────────────────
// Fetch all top-level comments (and nested replies) for a given movie/show.
// Replies are nested inside their parent under a `replies` array.
router.get("/", async (req, res) => {
  try {
    const { content_id } = req.query;

    if (!content_id) {
      return res.status(400).json({ error: "content_id is required" });
    }

    // Fetch all comments for this movie (both top-level and replies), oldest first
    const all = await Comment.find({ tmdbId: Number(content_id) })
      .populate("userId", "username")
      .sort({ createdAt: 1 })
      .lean();

    // Build a tree: separate top-level from replies
    const commentMap = {};
    const topLevel = [];

    all.forEach((c) => {
      commentMap[c._id] = { ...formatComment(c), replies: [] };
    });

    all.forEach((c) => {
      if (c.parentId) {
        const parent = commentMap[c.parentId];
        if (parent) {
          parent.replies.push(commentMap[c._id]);
        }
      } else {
        topLevel.push(commentMap[c._id]);
      }
    });

    res.json(topLevel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── POST /comments ───────────────────────────────────────────────────────────
// Add a new comment (or reply) to a movie/show.
// Body: { content_id, text, parent_id? }
router.post("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Login required" });
    }

    const { content_id, text, parent_id } = req.body;

    if (!content_id) {
      return res.status(400).json({ error: "content_id is required" });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    if (text.trim().length > 500) {
      return res
        .status(400)
        .json({ error: "Comment must be 500 characters or fewer" });
    }

    // If replying, verify the parent comment exists and belongs to the same movie
    if (parent_id) {
      const parent = await Comment.findById(parent_id);
      if (!parent) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
      if (Number(parent.tmdbId) !== Number(content_id)) {
        return res
          .status(400)
          .json({ error: "Parent comment does not belong to this movie" });
      }
    }

    const comment = await Comment.create({
      tmdbId: Number(content_id),
      userId: req.user._id,
      text: text.trim(),
      parentId: parent_id || null,
    });

    res.status(201).json({
      success: true,
      comment: {
        id: comment._id,
        content_id: comment.tmdbId,
        parent_id: comment.parentId || null,
        user_id: req.user._id,
        username: req.user.username,
        text: comment.text,
        is_deleted: false,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt,
        replies: [],
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── PATCH /comments/:id ──────────────────────────────────────────────────────
// Edit an existing comment (owner only).
// Body: { text }
router.patch("/:id", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Login required" });
    }

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    if (text.trim().length > 500) {
      return res
        .status(400)
        .json({ error: "Comment must be 500 characters or fewer" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ error: "Cannot edit a deleted comment" });
    }

    // Only the author may edit
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorised to edit this comment" });
    }

    comment.text = text.trim();
    await comment.save();

    res.json({
      success: true,
      comment: {
        id: comment._id,
        content_id: comment.tmdbId,
        parent_id: comment.parentId || null,
        user_id: req.user._id,
        username: req.user.username,
        text: comment.text,
        is_deleted: false,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ─── DELETE /comments/:id ─────────────────────────────────────────────────────
// Soft-delete a comment (owner only). The document is kept so threaded replies
// remain intact; the text is replaced with "[deleted]" on the way out.
router.delete("/:id", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Login required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Only the author may delete
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorised to delete this comment" });
    }

    comment.isDeleted = true;
    await comment.save();

    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
