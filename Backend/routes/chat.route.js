// routes/chat.routes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

// User types something like "alpha movie" -> resolves title (or returns disambiguation options)
router.post("/search", chatController.searchTitle);

// User picks one option from a disambiguation card
router.post("/select", chatController.selectTitle);

// Button taps (cast/rating/reviews/similar/storyline) AND free-text follow-ups
router.post("/message", chatController.handleMessage);

module.exports = router;