const mongoose = require("mongoose");

const spotifyConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Spotify display name (distinct from WatchVerse username)
    spotifyUsername: {
      type: String,
      default: null,
    },
    followers: {
      type: Number,
      default: 0,
    },
    topArtists: {
      type: [String],
      default: [],
    },
    topGenres: {
      type: [String],
      default: [],
    },
    // Timestamp of last successful sync from Spotify API
    // Allows the service to skip re-fetching if data is still fresh
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const SpotifyConnection =
  mongoose.models.SpotifyConnection ||
  mongoose.model("SpotifyConnection", spotifyConnectionSchema);
module.exports = SpotifyConnection;
