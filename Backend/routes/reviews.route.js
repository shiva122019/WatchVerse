const router = require("express").Router();
const mongoose = require("mongoose");
const Review = require("../Models/Review.js");
const reviewContent = require("../Models/reviewContent.js");
let { tmdb } = require("../services/tmdb.service.js");
// get all reviews for one item
router.get("/", async (req, res) => {
  try {
    const { content_id } = req.query;

    if (!content_id) {
      return res.status(400).json({
        error: "content_id is required",
      });
    }

    const reviews = await Review.find({
      tmdbId: String(content_id),
    })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });

    const formatted = reviews.map((review) => ({
      id: review._id,

      user_id: review.userId._id,

      username: review.userId.username,

      profile_picture: review.userId.profilePicture || null,

      rating: review.rating,

      text: review.comment,

      created_at: review.createdAt || new Date(),
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
    const { content_id, mediaType, rating, text } = req.body;

    if (!req.user) {
      return res.status(401).json({
        error: "Login required",
      });
    }

    if (!content_id || !mediaType) {
      return res.status(400).json({
        error: "content_id and mediaType are required",
      });
    }

    if (!["movie", "tv", "song"].includes(mediaType)) {
      return res.status(400).json({
        error: "Invalid media type",
      });
    }

    if (
      typeof rating !== "number" ||
      Number.isNaN(rating) ||
      rating < 1 ||
      rating > 5
    ) {
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
      tmdbId: String(content_id),
      userId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        error: "You have already reviewed this item",
      });
    }

    let title = null;
    let posterUrl = null;

    if (mediaType === "movie" || mediaType === "tv") {
      try {
        const tmdbRes = await tmdb.get(`/${mediaType}/${content_id}`);

        title = tmdbRes.data.title || tmdbRes.data.name;

        posterUrl = tmdbRes.data.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdbRes.data.poster_path}`
          : null;
      } catch (err) {
        console.error("Failed to fetch TMDB details:", err);

        return res.status(400).json({
          error: "Could not find that title on TMDB",
        });
      }
    }

    // TODO: Replace with Spotify lookup for songs.
    if (mediaType === "song") {
      title = "Unknown Song";
      posterUrl = null;
    }

    const review = await Review.create({
      tmdbId: String(content_id),
      mediaType,
      title,
      posterUrl,
      userId: req.user._id,
      rating,
      comment: text.trim(),
    });

    let content = await reviewContent.findOne({
      tmdbId: String(content_id),
      mediaType,
    });

    if (!content) {
      content = await reviewContent.create({
        tmdbId: String(content_id),
        mediaType,
        title,
        averageRating: rating,
        totalReviews: 1,
      });
    } else {
      const newCount = content.totalReviews + 1;

      content.averageRating = Number(
        (
          (content.averageRating * content.totalReviews + rating) /
          newCount
        ).toFixed(1),
      );

      content.totalReviews = newCount;

      if (!content.title) {
        content.title = title;
      }

      await content.save();
    }

    res.status(201).json({
      success: true,
      review: {
        id: review._id,
        user_id: req.user._id,
        username: req.user.username,
        tmdbId: review.tmdbId,
        mediaType: review.mediaType,
        title: review.title,
        posterUrl: review.posterUrl,
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
