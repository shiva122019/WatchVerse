const mongoose = require("mongoose");

const ACTIVITY_TYPES = [
  "rating",
  "review",
  "watchlist_add",
  "watchlist_remove",
  "watch_started",
  "watch_completed",
  "follow",
  "creator_post",
  "like_review",
];

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },
    // Human-readable subject of the activity (e.g. movie title, username)
    title: {
      type: String,
      required: true,
    },
    // Optional rating value (used for "rating" and "review" types)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // Reference to the target entity (tmdbId, review _id, user _id, post _id)
    targetId: {
      type: String,
      default: null,
    },
    // For "follow" type — the username of the followed user
    targetUser: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Timeline queries: recent activity for a user, sorted by date
activitySchema.index({ userId: 1, createdAt: -1 });

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);
module.exports = Activity;
