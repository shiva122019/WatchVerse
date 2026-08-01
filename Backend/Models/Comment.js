const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // The movie this comment belongs to
    tmdbId: {
      type: Number,
      required: true,
    },

    // The user who wrote the comment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Comment body text
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },

    // Optional: support nested replies by referencing a parent comment
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // Soft-delete flag so deleted comments can show "[deleted]" in threads
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast lookup of all comments on a given movie
commentSchema.index({ tmdbId: 1, createdAt: 1 });

// Index for fast lookup of replies to a parent comment
commentSchema.index({ parentId: 1 });

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
module.exports = Comment;
