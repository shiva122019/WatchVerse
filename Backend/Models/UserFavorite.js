const mongoose = require("mongoose");

const FAVORITE_CATEGORIES = ["movie", "show", "song", "actor", "director"];

const userFavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: FAVORITE_CATEGORIES,
      required: true,
    },
    // TMDB movie/show ID, or TMDB person ID for actors/directors
    externalId: {
      type: String,
      required: true,
    },

    // ── Movie / Show fields ───────────────────────────────────────
    title: {
      type: String,
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    posterUrl: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },

    // ── Actor / Director fields ───────────────────────────────────
    name: {
      type: String,
      default: null,
    },
    photoUrl: {
      type: String,
      default: null,
    },

    // Controls display order within each category
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// A user can only favorite a specific item in a category once
userFavoriteSchema.index(
  { userId: 1, category: 1, externalId: 1 },
  { unique: true },
);

// Fast retrieval: all favorites for a user grouped by category
userFavoriteSchema.index({ userId: 1, category: 1, sortOrder: 1 });

const UserFavorite =
  mongoose.models.UserFavorite ||
  mongoose.model("UserFavorite", userFavoriteSchema);
module.exports = UserFavorite;
