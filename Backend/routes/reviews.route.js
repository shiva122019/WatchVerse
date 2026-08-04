router = require("express").Router();
mongoose = require("mongoose");
Review = require("../models/Review.js");
reviewContent = require("../Models/reviewContent.js");

// get all reviews for one item
router.get("/", async (req, res) => {
  try {
    const { content_id } = req.query;

    if (!content_id || isNaN(Number(content_id))) {
      return res.status(400).json({
        error: "Valid content_id is required",
      });
    }

    const reviews = await Review.find({
      tmdbId: Number(content_id),
    }).sort({ createdAt: -1 });

    const formatted = reviews.map((review) => ({
      id: review._id,

      user_id: review.userId._id,

      username: review.userId.username,

      profile_picture: review.userId.profilePicture || null,

      rating: review.rating,

      text: review.comment,

      created_at: review.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { content_id, rating, text } = req.body;

    if (!req.user) {
      return res.status(401).json({
        error: "Login required",
      });
    }

    if (!content_id || isNaN(Number(content_id))) {
      return res.status(400).json({
        error: "Valid content_id is required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    if (!text || text.trim().length < 3) {
      return res.status(400).json({
        error: "Review must be at least 3 characters",
      });
    }

    const existing = await Review.findOne({
      tmdbId: Number(content_id),
      userId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        error: "You have already reviewed this item",
      });
    }

    const review = await Review.create({
      tmdbId: Number(content_id),
      userId: req.user._id,
      rating,
      comment: text.trim(),
    });

    let content = await reviewContent.findOne({
      tmdbId: Number(content_id),
    });

    if (!content) {
      // First review for this movie
      content = await reviewContent.create({
        tmdbId: Number(content_id),
        averageRating: rating,
        totalReviews: 1,
      });
    } else {
      const oldAverage = content.averageRating;
      const oldCount = content.totalReviews;

      const newCount = oldCount + 1;

      const newAverage = (oldAverage * oldCount + rating) / newCount;

      content.averageRating = Number(newAverage.toFixed(1));
      content.totalReviews = newCount;

      await content.save();
    }

    res.status(201).json({
      success: true,

      review: {
        id: review._id,

        user_id: req.user._id,

        username: req.user.username,

        rating: review.rating,

        text: review.comment,

        created_at: review.createdAt,
      },

      average_rating: content.averageRating.toFixed(1),

      review_count: content.totalReviews,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: "You have already reviewed this item",
      });
    }

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

module.exports = router;
