const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    // The user who is doing the following
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The user being followed
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// A user can only follow another user once
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Fast lookup: "who follows user X?" (for follower count / list)
followSchema.index({ following: 1, createdAt: -1 });

const Follow = mongoose.models.Follow || mongoose.model("Follow", followSchema);
module.exports = Follow;
