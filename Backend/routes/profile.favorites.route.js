const router = require("express").Router();
const User = require("../Models/User");
const UserFavorite = require("../Models/UserFavorite");
const profileService = require("../services/profile.service");
const { isAuthenticated } = require("../middleware/auth");
const AppError = require("../lib/AppError");

/**
 * GET /profile/favorites/mine
 * Returns the authenticated user's favorites categorized, plus a simple map for fast client lookup.
 */
router.get("/favorites/mine", isAuthenticated, async (req, res, next) => {
  try {
    const favorites = await profileService.getFavorites(req.user._id);
    const rawFavs = await UserFavorite.find({ userId: req.user._id }).lean();

    // Map of "category:externalId" -> true
    const favoriteMap = {};
    for (const f of rawFavs) {
      favoriteMap[`${f.category}:${f.externalId}`] = f._id;
    }

    res.json({
      ...favorites,
      favoriteMap,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /profile/:username/favorites
 * Returns user's favorites categorized into movies, shows, actors, directors.
 */
router.get("/:username/favorites", async (req, res, next) => {
  try {
    const targetUser = await User.findOne({
      username: req.params.username.trim(),
    });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const favorites = await profileService.getFavorites(targetUser._id);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /profile/favorites/toggle
 * Toggle favorite status (adds if not exists, removes if already favorited).
 */
router.post("/favorites/toggle", isAuthenticated, async (req, res, next) => {
  try {
    const {
      category,
      externalId,
      title,
      year,
      posterUrl,
      rating,
      name,
      photoUrl,
    } = req.body;

    if (!category || !externalId) {
      throw new AppError("Category and externalId are required", 400);
    }

    if (!["movie", "show", "song", "actor", "director"].includes(category)) {
      throw new AppError("Invalid category type", 400);
    }

    const existing = await UserFavorite.findOne({
      userId: req.user._id,
      category,
      externalId: String(externalId),
    });

    if (existing) {
      await UserFavorite.deleteOne({ _id: existing._id });
      return res.json({
        success: true,
        favorited: false,
        message: "Removed from favorites",
      });
    }

    const favorite = await UserFavorite.create({
      userId: req.user._id,
      category,
      externalId: String(externalId),
      title: title || null,
      year: year ? Number(year) : null,
      posterUrl: posterUrl || null,
      rating: rating !== undefined && rating !== null ? Number(rating) : null,
      name: name || null,
      photoUrl: photoUrl || null,
    });

    res.status(201).json({
      success: true,
      favorited: true,
      message: "Added to favorites",
      favorite,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /profile/favorites
 * Add a new item to user's favorites.
 * Request body: { category: "movie"|"show"|"actor"|"director", externalId, title, year, posterUrl, rating, name, photoUrl }
 */
router.post("/favorites", isAuthenticated, async (req, res, next) => {
  try {
    const {
      category,
      externalId,
      title,
      year,
      posterUrl,
      rating,
      name,
      photoUrl,
    } = req.body;

    if (!category || !externalId) {
      throw new AppError("Category and externalId are required", 400);
    }

    if (!["movie", "show", "actor", "director"].includes(category)) {
      throw new AppError("Invalid category type", 400);
    }

    const favorite = await UserFavorite.findOneAndUpdate(
      {
        userId: req.user._id,
        category,
        externalId: String(externalId),
      },
      {
        title: title || null,
        year: year ? Number(year) : null,
        posterUrl: posterUrl || null,
        rating: rating !== undefined && rating !== null ? Number(rating) : null,
        name: name || null,
        photoUrl: photoUrl || null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(201).json({
      success: true,
      favorited: true,
      message: "Favorite added successfully",
      favorite,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /profile/favorites/item/:category/:externalId
 * Remove a favorite by category and externalId.
 */
router.delete(
  "/favorites/item/:category/:externalId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { category, externalId } = req.params;
      const favorite = await UserFavorite.findOneAndDelete({
        userId: req.user._id,
        category,
        externalId: String(externalId),
      });

      if (!favorite) {
        throw new AppError("Favorite not found", 404);
      }

      res.json({
        success: true,
        favorited: false,
        message: "Favorite removed successfully",
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /profile/favorites/:id
 * Remove an item from user's favorites by favorite ObjectId.
 */
router.delete("/favorites/:id", isAuthenticated, async (req, res, next) => {
  try {
    const favorite = await UserFavorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!favorite) {
      throw new AppError("Favorite not found", 404);
    }

    res.json({
      success: true,
      favorited: false,
      message: "Favorite removed successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
