const User = require("../Models/User");
const Review = require("../Models/Review");
const WatchList = require("../Models/WatchList");
const UserFavorite = require("../Models/UserFavorite");
const statisticsService = require("./statistics.service");
const activityService = require("./activity");
const spotifyProfileService = require("./spotify.profile.service");
const creatorService = require("./creator.service");
const tmdbService = require("./tmdb.service");
const spotifyService = require("./spotify.service");
const AppError = require("../lib/AppError");
let { tmdb } = require("./tmdb.service");
/**
 * Assemble the full profile object that the frontend expects.
 *
 * This is the single source of truth for the profile response shape.
 * Every field maps 1:1 to the mockProfile the frontend currently uses.
 *
 * All sub-queries run in parallel via Promise.all for performance.
 *
 * @param {string} userId - MongoDB _id of the user
 * @returns {Promise<Object>} - the complete profile object
 */
async function buildProfile(userId) {
  const user = await User.findById(userId).select("-hash -__v").lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Fire all independent queries in parallel
  const [
    stats,
    spotify,
    recentActivity,
    activityTimeline,
    favorites,
    recentReviews,
    allReviews,
    watchlist,
    creatorPosts,
  ] = await Promise.all([
    statisticsService.getStats(userId),
    spotifyProfileService.getSpotifyProfile(userId),
    activityService.getRecentActivity(userId, 5),
    activityService.getActivityTimeline(userId, 50),
    getFavorites(userId),
    getReviews(userId, { limit: 3 }),
    getReviews(userId, { limit: 50 }),
    getWatchlist(userId),
    creatorService.getCreatorPosts(userId),
  ]);

  return {
    id: user._id,
    displayName: user.displayName || user.username,
    username: user.username,
    role: user.role || "member",
    verified: user.verified || false,
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    joinDate: user.createdAt || null,
    bannerUrl: user.bannerUrl || null,
    avatarUrl: user.avatar || null,

    stats: {
      ...stats,
      totalPosts:
        (creatorPosts.movies?.length || 0) + (creatorPosts.music?.length || 0),
    },
    spotify,
    recentActivity,

    favoriteMovies: favorites.movies,
    favoriteShows: favorites.shows,
    favoriteMusic: favorites.songs,
    favoriteActors: favorites.actors,
    favoriteDirectors: favorites.directors,

    recentReviews,
    allReviews,

    watchlist,

    activityTimeline,

    creatorPosts,
  };
}

/**
 * Fetch and shape reviews for the profile page.
 *
 * @param {string} userId
 * @param {{limit?: number, page?: number}} options
 */
async function getReviews(userId, { limit = 10, page = 1 } = {}) {
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return reviews.map((r) => ({
    id: r._id,
    title: r.title || null,
    posterUrl: r.posterUrl || null,
    rating: r.rating,
    body: r.comment,
    date: r.createdAt,
  }));
}

/**
 * Fetch paginated reviews with total count (for the dedicated reviews endpoint).
 */
async function getReviewsPaginated(userId, { limit = 10, page = 1 } = {}) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ userId }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r._id,
      title: r.title || null,
      posterUrl: r.posterUrl || null,
      rating: r.rating,
      body: r.comment,
      date: r.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Fetch all four favorites categories for a user.
 */
async function getFavorites(userId) {
  const favorites = await UserFavorite.find({ userId })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const result = {
    movies: [],
    shows: [],
    songs: [],
    actors: [],
    directors: [],
  };

  for (const fav of favorites) {
    switch (fav.category) {
      case "movie":
        result.movies.push({
          id: fav._id,
          title: fav.title,
          year: fav.year,
          posterUrl: fav.posterUrl || null,
          rating: fav.rating,
        });
        break;
      case "show":
        result.shows.push({
          id: fav._id,
          title: fav.title,
          year: fav.year,
          posterUrl: fav.posterUrl || null,
          rating: fav.rating,
        });
        break;
      case "song":
        result.songs.push({
          id: fav._id,
          title: fav.title,
          year: fav.year,
          posterUrl: fav.posterUrl || null,
          rating: fav.rating,
        });
        break;
      case "actor":
        result.actors.push({
          id: fav._id,
          name: fav.name,
          photoUrl: fav.photoUrl || null,
        });
        break;
      case "director":
        result.directors.push({
          id: fav._id,
          name: fav.name,
          photoUrl: fav.photoUrl || null,
        });
        break;
    }
  }

  return result;
}

/**
 * Fetch and group watchlist entries by status.
 * Reuses the existing WatchList model.
 */
async function getWatchlist(userId) {
  const entries = await WatchList.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  const watchlist = {
    wantToWatch: [],
    watching: [],
    watched: [],
    music: [],
  };

  const statusKeyMap = {
    want: "wantToWatch",
    watching: "watching",
    watched: "watched",
  };

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.mediaType === "song") {
        const track = await spotifyService.getTrack(entry.tmdbId);
        if (track) {
          // Keep the entry ID so we can remove it from watchlist if needed
          watchlist.music.push({ ...track, entryId: entry._id });
        }
      } else {
        const key = statusKeyMap[entry.status];
        if (key) {
          try {
            const details = await tmdbService.getDetails(
              entry.tmdbId,
              entry.mediaType,
            );
            watchlist[key].push({
              id: entry._id,
              tmdbId: entry.tmdbId,
              title: details.title || details.name,
              year: (
                details.release_date ||
                details.first_air_date ||
                ""
              ).slice(0, 4),
              posterUrl: details.poster_path
                ? `https://image.tmdb.org/t/p/w342${details.poster_path}`
                : null,
              rating: details.vote_average
                ? Number((details.vote_average / 2).toFixed(1))
                : null,
            });
          } catch (e) {
            // Fallback if TMDB fails
            watchlist[key].push({
              id: entry._id,
              tmdbId: entry.tmdbId,
              title: `Unknown ${entry.mediaType} (${entry.tmdbId})`,
              year: null,
              posterUrl: null,
            });
          }
        }
      }
    }),
  );

  return watchlist;
}

module.exports = {
  buildProfile,
  getReviews,
  getReviewsPaginated,
  getFavorites,
  getWatchlist,
};
