const router = require("express").Router();

const User = require("../Models/User");
const UserFavorite = require("../Models/UserFavorite");
const UserPreference = require("../Models/UserPreference");

const profileService = require("../services/profile.service");
const { isAuthenticated } = require("../middleware/auth");
const AppError = require("../lib/AppError");
const tmdb = require("../lib/tmdb");

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------

// Every favorite contributes +10.
// Removing a favorite contributes -10.
const FAVORITE_WEIGHT = 10;

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

/**
 * Keep preference scores within the schema limits.
 */
function clampScore(score) {
  return Math.max(-100, Math.min(100, score));
}

/**
 * Get TMDB details and credits for a movie or TV show.
 *
 * Used to determine:
 * - genres
 * - top 5 actors
 */
async function getContentPreferenceData(category, externalId) {
  if (category !== "movie" && category !== "show") {
    return null;
  }

  const detailsEndpoint =
    category === "movie" ? `/movie/${externalId}` : `/tv/${externalId}`;

  const creditsEndpoint =
    category === "movie"
      ? `/movie/${externalId}/credits`
      : `/tv/${externalId}/credits`;

  const [detailsResponse, creditsResponse] = await Promise.all([
    tmdb.get(detailsEndpoint),
    tmdb.get(creditsEndpoint),
  ]);

  const details = detailsResponse.data;
  const credits = creditsResponse.data;

  return {
    genres: details.genres || [],
    actors: (credits.cast || []).slice(0, 5),
  };
}

/**
 * Update genre and actor preferences for
 * a movie or TV show.
 *
 * delta:
 *   +10 -> favorite
 *   -10 -> unfavorite
 */
async function updateContentPreferences(userId, category, externalId, delta) {
  const contentData = await getContentPreferenceData(category, externalId);

  if (!contentData) {
    return;
  }

  let preferences = await UserPreference.findOne({
    user: userId,
  });

  /**
   * User may not have completed onboarding yet.
   * Create their preference document if necessary.
   */
  if (!preferences) {
    preferences = new UserPreference({
      user: userId,
      genrePreferences: [],
      actorPreferences: [],
      directorPreferences: [],
      onboardingCompleted: false,
    });
  }

  // -------------------------------------------------------
  // GENRES
  // -------------------------------------------------------

  for (const genre of contentData.genres) {
    const existingGenre = preferences.genrePreferences.find(
      (item) => item.genreId === genre.id,
    );

    if (existingGenre) {
      existingGenre.score = clampScore(existingGenre.score + delta);

      /**
       * If removing a favorite brings the score to zero,
       * remove the preference entry.
       */
      if (existingGenre.score === 0) {
        preferences.genrePreferences = preferences.genrePreferences.filter(
          (item) => item.genreId !== genre.id,
        );
      }
    } else if (delta > 0) {
      /**
       * Only create a new preference entry when adding.
       *
       * We don't create a -10 preference for something
       * the user never had a positive preference for.
       */
      preferences.genrePreferences.push({
        genreId: genre.id,
        genreName: genre.name,
        score: delta,
      });
    }
  }

  // -------------------------------------------------------
  // ACTORS
  // -------------------------------------------------------

  for (const actor of contentData.actors) {
    const existingActor = preferences.actorPreferences.find(
      (item) => item.actorId === actor.id,
    );

    if (existingActor) {
      existingActor.score = clampScore(existingActor.score + delta);

      /**
       * Remove the actor if their total score reaches zero.
       */
      if (existingActor.score === 0) {
        preferences.actorPreferences = preferences.actorPreferences.filter(
          (item) => item.actorId !== actor.id,
        );
      }
    } else if (delta > 0) {
      preferences.actorPreferences.push({
        actorId: actor.id,
        actorName: actor.name,
        score: delta,
      });
    }
  }

  // -------------------------------------------------------
  // SORT
  // -------------------------------------------------------

  preferences.genrePreferences.sort((a, b) => b.score - a.score);

  preferences.actorPreferences.sort((a, b) => b.score - a.score);

  await preferences.save();
}

/**
 * Update director preference.
 *
 * delta:
 *   +10 -> favorite
 *   -10 -> unfavorite
 */
async function updateDirectorPreference(
  userId,
  externalId,
  directorName,
  delta,
) {
  let preferences = await UserPreference.findOne({
    user: userId,
  });

  if (!preferences) {
    preferences = new UserPreference({
      user: userId,
      genrePreferences: [],
      actorPreferences: [],
      directorPreferences: [],
      onboardingCompleted: false,
    });
  }

  if (!preferences.directorPreferences) {
    preferences.directorPreferences = [];
  }

  const directorId = Number(externalId);

  if (!Number.isFinite(directorId)) {
    return;
  }

  const existingDirector = preferences.directorPreferences.find(
    (item) => item.directorId === directorId,
  );

  if (existingDirector) {
    existingDirector.score = clampScore(existingDirector.score + delta);

    /**
     * If the total score becomes zero,
     * remove the director preference.
     */
    if (existingDirector.score === 0) {
      preferences.directorPreferences = preferences.directorPreferences.filter(
        (item) => item.directorId !== directorId,
      );
    }
  } else if (delta > 0) {
    /**
     * Only create a new director preference when
     * the user is actually adding the favorite.
     */
    preferences.directorPreferences.push({
      directorId,
      directorName: directorName || "Unknown Director",
      score: delta,
    });
  }

  preferences.directorPreferences.sort((a, b) => b.score - a.score);

  await preferences.save();
}

/**
 * Central function that determines which preference
 * system should be updated.
 */
async function updatePreferencesForFavorite({
  userId,
  category,
  externalId,
  name,
  delta,
}) {
  // Movie / TV show
  if (category === "movie" || category === "show") {
    await updateContentPreferences(userId, category, externalId, delta);

    return;
  }

  // Director
  if (category === "director") {
    await updateDirectorPreference(userId, externalId, name, delta);

    return;
  }

  /**
   * Currently:
   *
   * song   -> favorite only
   * actor  -> favorite only
   *
   * They don't modify UserPreference because your
   * current preference model doesn't define those
   * preference types.
   */
}

// =========================================================
// GET /profile/favorites/mine
// =========================================================

router.get("/favorites/mine", isAuthenticated, async (req, res, next) => {
  try {
    const favorites = await profileService.getFavorites(req.user._id);

    const rawFavs = await UserFavorite.find({
      userId: req.user._id,
    }).lean();

    /**
     * Map:
     *
     * "movie:123" -> ObjectId
     * "show:456"  -> ObjectId
     * "director:789" -> ObjectId
     */
    const favoriteMap = {};

    for (const favorite of rawFavs) {
      favoriteMap[`${favorite.category}:${favorite.externalId}`] = favorite._id;
    }

    res.json({
      ...favorites,
      favoriteMap,
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================
// GET /profile/:username/favorites
// =========================================================

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

// =========================================================
// POST /profile/favorites/toggle
// =========================================================

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

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!category || !externalId) {
      throw new AppError("Category and externalId are required", 400);
    }

    const allowedCategories = ["movie", "show", "song", "actor", "director"];

    if (!allowedCategories.includes(category)) {
      throw new AppError("Invalid category type", 400);
    }

    const normalizedExternalId = String(externalId);

    // ---------------------------------------------------
    // CHECK EXISTING FAVORITE
    // ---------------------------------------------------

    const existing = await UserFavorite.findOne({
      userId: req.user._id,
      category,
      externalId: normalizedExternalId,
    });

    // ===================================================
    // REMOVE FAVORITE
    // ===================================================

    if (existing) {
      await UserFavorite.deleteOne({
        _id: existing._id,
      });

      /**
       * Reverse the +10 contribution.
       */
      await updatePreferencesForFavorite({
        userId: req.user._id,
        category,
        externalId: normalizedExternalId,
        name: existing.name,
        delta: -FAVORITE_WEIGHT,
      });

      return res.json({
        success: true,
        favorited: false,
        favorite: null,
        message: "Removed from favorites",
      });
    }

    // ===================================================
    // ADD FAVORITE
    // ===================================================

    const favorite = await UserFavorite.create({
      userId: req.user._id,
      category,
      externalId: normalizedExternalId,

      title: title || null,

      year:
        year !== undefined && year !== null && year !== ""
          ? Number(year)
          : null,

      posterUrl: posterUrl || null,

      rating:
        rating !== undefined && rating !== null && rating !== ""
          ? Number(rating)
          : null,

      name: name || null,

      photoUrl: photoUrl || null,
    });

    /**
     * Add +10 to relevant preferences.
     */
    await updatePreferencesForFavorite({
      userId: req.user._id,
      category,
      externalId: normalizedExternalId,
      name,
      delta: FAVORITE_WEIGHT,
    });

    return res.status(201).json({
      success: true,
      favorited: true,

      /**
       * Your frontend uses:
       *
       * res.data.favorite
       *
       * so return the actual favorite document.
       */
      favorite,

      message: "Added to favorites",
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================
// POST /profile/favorites
// =========================================================

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

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!category || !externalId) {
      throw new AppError("Category and externalId are required", 400);
    }

    const allowedCategories = ["movie", "show", "song", "actor", "director"];

    if (!allowedCategories.includes(category)) {
      throw new AppError("Invalid category type", 400);
    }

    const normalizedExternalId = String(externalId);

    // ---------------------------------------------------
    // PREVENT DUPLICATE PREFERENCE CONTRIBUTION
    // ---------------------------------------------------

    const existing = await UserFavorite.findOne({
      userId: req.user._id,
      category,
      externalId: normalizedExternalId,
    });

    if (existing) {
      return res.json({
        success: true,
        favorited: true,
        favorite: existing,
        message: "Already in favorites",
      });
    }

    // ---------------------------------------------------
    // CREATE FAVORITE
    // ---------------------------------------------------

    const favorite = await UserFavorite.create({
      userId: req.user._id,
      category,
      externalId: normalizedExternalId,

      title: title || null,

      year:
        year !== undefined && year !== null && year !== ""
          ? Number(year)
          : null,

      posterUrl: posterUrl || null,

      rating:
        rating !== undefined && rating !== null && rating !== ""
          ? Number(rating)
          : null,

      name: name || null,

      photoUrl: photoUrl || null,
    });

    // ---------------------------------------------------
    // ADD +10 PREFERENCE
    // ---------------------------------------------------

    await updatePreferencesForFavorite({
      userId: req.user._id,
      category,
      externalId: normalizedExternalId,
      name,
      delta: FAVORITE_WEIGHT,
    });

    res.status(201).json({
      success: true,
      favorited: true,
      favorite,
      message: "Favorite added successfully",
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================
// DELETE /profile/favorites/item/:category/:externalId
// =========================================================

router.delete(
  "/favorites/item/:category/:externalId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { category, externalId } = req.params;

      const allowedCategories = ["movie", "show", "song", "actor", "director"];

      if (!allowedCategories.includes(category)) {
        throw new AppError("Invalid category type", 400);
      }

      const normalizedExternalId = String(externalId);

      // ---------------------------------------------------
      // FIND AND DELETE
      // ---------------------------------------------------

      const favorite = await UserFavorite.findOneAndDelete({
        userId: req.user._id,
        category,
        externalId: normalizedExternalId,
      });

      if (!favorite) {
        throw new AppError("Favorite not found", 404);
      }

      // ---------------------------------------------------
      // REVERSE +10
      // ---------------------------------------------------

      await updatePreferencesForFavorite({
        userId: req.user._id,
        category,
        externalId: normalizedExternalId,
        name: favorite.name,
        delta: -FAVORITE_WEIGHT,
      });

      res.json({
        success: true,
        favorited: false,
        favorite: null,
        message: "Favorite removed successfully",
      });
    } catch (err) {
      next(err);
    }
  },
);

// =========================================================
// DELETE /profile/favorites/:id
// =========================================================

router.delete("/favorites/:id", isAuthenticated, async (req, res, next) => {
  try {
    // ---------------------------------------------------
    // FIND AND DELETE
    // ---------------------------------------------------

    const favorite = await UserFavorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!favorite) {
      throw new AppError("Favorite not found", 404);
    }

    // ---------------------------------------------------
    // REVERSE +10
    // ---------------------------------------------------

    await updatePreferencesForFavorite({
      userId: req.user._id,
      category: favorite.category,
      externalId: favorite.externalId,
      name: favorite.name,
      delta: -FAVORITE_WEIGHT,
    });

    res.json({
      success: true,
      favorited: false,
      favorite: null,
      message: "Favorite removed successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
