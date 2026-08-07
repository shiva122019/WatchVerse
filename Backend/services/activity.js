const Review = require("../Models/Review");
const Watchlist = require("../Models/WatchList");
const Comment = require("../Models/Comment");

/**
 * Activity is now derived from Review, Watchlist, and Comment,
 * so nothing needs to be written.
 */
async function logActivity() {
  return null;
}

/**
 * Fetch and normalize all activity for a user into one flat, sorted array.
 * Shared by getRecentActivity and getActivityTimeline so the merge logic
 * only lives in one place.
 */
async function collectActivities(userId) {
  const [reviews, watchlist, comments] = await Promise.all([
    Review.find({ userId }).lean(),
    Watchlist.find({ user: userId }).lean(), // NOTE: verify Watchlist schema actually uses `user`, not `userId`
    Comment.find({ userId }).lean(),
  ]);

  const activities = [];

  reviews.forEach((review) => {
    activities.push({
      _id: review._id,
      type: "review",
      title: review.title,
      rating: review.rating,
      createdAt: review.createdAt,
    });
  });

  watchlist.forEach((item) => {
    let type = "watchlist_add";

    if (item.status === "watching") {
      type = "watch_started";
    } else if (item.status === "watched") {
      type = "watch_completed";
    }

    activities.push({
      _id: item._id,
      type,
      title: item.title,
      createdAt: item.createdAt,
    });
  });

  comments.forEach((comment) => {
    activities.push({
      _id: comment._id,
      type: "comment",
      title: "Discussion",
      createdAt: comment.createdAt,
    });
  });

  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return activities;
}

/**
 * Get the most recent activity entries for a user.
 *
 * @param {string} userId
 * @param {number} [limit=5]
 * @returns {Promise<Array<{id, type, title, rating, timestamp}>>}
 */
async function getRecentActivity(userId, limit = 5) {
  const activities = await collectActivities(userId);

  return activities.slice(0, limit).map((activity) => ({
    id: activity._id,
    type: activity.type,
    title: activity.title,
    rating: activity.rating ?? undefined,
    timestamp: activity.createdAt,
  }));
}

/**
 * Build grouped activity timeline for the profile.
 *
 * @param {string} userId
 * @param {number} [limit=50]
 * @returns {Promise<Array<{id:string,label:string,entries:Array}>>}
 */
async function getActivityTimeline(userId, limit = 50) {
  const activities = await collectActivities(userId);

  const groups = new Map();

  for (const activity of activities.slice(0, limit)) {
    const label = getRelativeLabel(activity.createdAt);

    if (!groups.has(label)) {
      groups.set(label, []);
    }

    groups.get(label).push({
      id: activity._id,
      text: buildActivityText(activity),
      rating: activity.rating ?? undefined,
    });
  }

  let index = 0;
  const timeline = [];

  for (const [label, entries] of groups) {
    timeline.push({
      id: `t${++index}`,
      label,
      entries,
    });
  }

  return timeline;
}

/**
 * Convert a date into a human-readable relative label.
 */
function getRelativeLabel(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Build a human-readable activity description.
 */
function buildActivityText(activity) {
  switch (activity.type) {
    case "rating":
      return `Rated ${activity.title}`;

    case "review":
      return `Reviewed ${activity.title}`;

    case "watchlist_add":
      return `Added ${activity.title} to watchlist`;

    case "watch_started":
      return `Started watching ${activity.title}`;

    case "watch_completed":
      return `Finished watching ${activity.title}`;

    case "comment":
      return "Commented on a discussion";

    case "watchlist_remove":
      return `Removed ${activity.title} from watchlist`;

    case "follow":
      return `Followed ${activity.targetUser || activity.title}`;

    case "creator_post":
      return `Published "${activity.title}"`;

    case "like_review":
      return `Liked a review of ${activity.title}`;

    default:
      return activity.title;
  }
}

module.exports = {
  logActivity,
  getRecentActivity,
  getActivityTimeline,
};
