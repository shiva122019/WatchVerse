const mongoose = require("mongoose");

const POST_TYPES = ["movie", "music"];

const creatorPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: POST_TYPES,
      required: true,
      default: "movie"
    },
    format: {
      type: String,
      default: null, // "full movie", "short film", "trailer", "web series", etc.
    },
    category: [{
      type: String,
    }],
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
    videoUrl: {
      type: String,
      default: null,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    watchTime: {
      type: Number, // in seconds
      default: 0,
    },
    uniqueViewers: [{
      type: String, // Storing IPs or User IDs
    }],
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
