mongoose = require("mongoose");

// The thing being reviewed (movie, show, song) — reviews point back to
// this via itemId. tmdbId is String so it can hold both numeric TMDB
// ids ("603692") and Spotify track ids ("4iV5W9uYEdYUVa79Axb7Rh").
const contentSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: String,
    },
    // cached values so we don't recalculate from all reviews every page load
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const reviewContent = mongoose.model("Content", contentSchema);
module.exports = reviewContent;