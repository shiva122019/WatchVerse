const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // String so it can hold both numeric TMDB ids and string Spotify ids
    tmdbId: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["movie", "tv", "song"],
      required: true,
    },
    status: {
      type: String,
      enum: ["want", "watching", "watched"],
      default: "want",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

watchlistSchema.index(
  {
    user: 1,
    tmdbId: 1,
    mediaType: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Watchlist", watchlistSchema);