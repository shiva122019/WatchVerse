mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
    },
    spotiftid: {
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

// Prevents the same user from reviewing the same item more than once
reviewSchema.index({ tmdbId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
