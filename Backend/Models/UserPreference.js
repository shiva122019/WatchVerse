const mongoose = require("mongoose");

const genrePreferenceSchema = new mongoose.Schema(
  {
    genreId: {
      type: Number,
      required: true,
    },
    genreName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
  },
  { _id: false },
);

const actorPreferenceSchema = new mongoose.Schema(
  {
    actorId: {
      type: Number,
      required: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
  },
  { _id: false },
);

const userPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    genrePreferences: {
      type: [genrePreferenceSchema],
      default: [],
    },

    actorPreferences: {
      type: [actorPreferenceSchema],
      default: [],
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("UserPreference", userPreferenceSchema);
