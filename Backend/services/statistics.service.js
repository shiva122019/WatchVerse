const WatchList = require("../Models/WatchList");
const Review = require("../Models/Review");
const Follow = require("../Models/Follow");

/**
 * Compute profile statistics for a user via aggregation.
 *
 * None of these values are stored — they are always derived from the
 * source collections so they stay accurate without sync logic.
 *
 * @param {import("mongoose").Types.ObjectId} userId
 * @returns {Promise<{moviesWatched: number, showsWatched: number, reviews: number, followers: number, following: number}>}
 */
async function getStats(userId) {
  const [watchlistCounts, reviewCount, followerCount, followingCount] =
    await Promise.all([
      // Count movies and shows with status "watched" in a single aggregation
      WatchList.aggregate([
        { $match: { user: userId, status: "watched" } },
        {
          $group: {
            _id: "$mediaType",
            count: { $sum: 1 },
          },
        },
      ]),

      Review.countDocuments({ userId }),

      Follow.countDocuments({ following: userId }),

      Follow.countDocuments({ follower: userId }),
    ]);

  // Convert the aggregation result array into a lookup map
  const countsByType = {};
  for (const entry of watchlistCounts) {
    countsByType[entry._id] = entry.count;
  }

  return {
    moviesWatched: countsByType["movie"] || 0,
    showsWatched: countsByType["tv"] || 0,
    reviews: reviewCount,
    followers: followerCount,
    following: followingCount,
  };
}

module.exports = { getStats };
