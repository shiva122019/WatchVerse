const mongoose = require("mongoose");

const karaokeRecordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  songId: {
    type: String,
    required: true,
  },
  songTitle: {
    type: String,
    required: true,
  },
  songArtist: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("KaraokeRecording", karaokeRecordingSchema);
