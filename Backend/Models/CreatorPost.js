const mongoose = require("mongoose");

const POST_CATEGORIES = ["trailer", "announcement", "latestRelease"];

const creatorPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: POST_CATEGORIES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    thumbUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Fast retrieval: all posts for a creator, newest first
creatorPostSchema.index({ userId: 1, createdAt: -1 });

const CreatorPost =
  mongoose.models.CreatorPost ||
  mongoose.model("CreatorPost", creatorPostSchema);
module.exports = CreatorPost;
