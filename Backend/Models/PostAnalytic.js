const mongoose = require("mongoose");

const postAnalyticSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreatorPost",
      required: true,
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // format: YYYY-MM-DD
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    watchTime: {
      type: Number, // in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast upserting daily stats per post
postAnalyticSchema.index({ postId: 1, date: 1 }, { unique: true });

// Index for getting a creator's analytics over a date range
postAnalyticSchema.index({ creatorId: 1, date: 1 });

const PostAnalytic = mongoose.models.PostAnalytic || mongoose.model("PostAnalytic", postAnalyticSchema);
module.exports = PostAnalytic;
