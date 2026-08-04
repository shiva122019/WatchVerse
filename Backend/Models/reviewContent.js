mongoose = require("mongoose");

// The thing being reviewed (movie, show, etc.) — reviews point back to this via itemId
const contentSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
    },
    // cached values so we don't recalculate from all reviews every page load
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const reviewContent = mongoose.model("Content", contentSchema);
module.exports = reviewContent;
