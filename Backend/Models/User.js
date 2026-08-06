const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hash: {
      type: String,
      required: false,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      default: null,
    },
    spotify: {
      connected: {
        type: Boolean,
        default: false,
      },
      id: {
        type: String,
        default: null,
      },
      refreshToken: {
        type: String,
        default: null,
      },
    },

    // ── Profile fields (consumed by GET /profile/me) ──────────────
    role: {
      type: String,
      enum: ["member", "creator"],
      default: "member",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt serves as joinDate
  },
);

module.exports = mongoose.model("User", userSchema);
