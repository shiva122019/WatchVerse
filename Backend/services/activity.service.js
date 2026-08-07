const Activity = require("../Models/Activity");

/**
 * Log a new activity event for a user.
 *
 * @param {{userId: string, type: string, title: string, rating?: number, targetId?: string, targetUser?: string}} data
 * @returns {Promise<import("mongoose").Document>}
 */
async function logActivity(data) {
  return Activity.create({
    userId: data.userId,
    type: data.type,
    title: data.title,
    rating: data.rating || null,
    targetId: data.targetId || null,
    targetUser: data.targetUser || null,
  });
}

/**
 * Get the most recent activity entries for a user.
 * Powers the "recentActivity" array on the profile.
 *
 * @param {string} userId
 * @param {number} [limit=5]
 * @returns {Promise<Array<{id, type, title, rating, timestamp}>>}
 */
async function getRecentActivity(userId, limit = 5) {
  const activities = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return activities.map((a) => ({
    id: a._id,
    type: a.type,
    title: a.title,
    rating: a.rating || undefined,
    timestamp: a.createdAt,
  }));
}

/**
 * Build grouped activity timeline for the profile.
 *
 * Groups activities by relative date labels ("Yesterday", "2 days ago",
 * "1 week ago", etc.) to match the frontend's activityTimeline shape:
 *   [{ id, label, entries: [{ id, text, rating? }] }]
 *
 * @param {string} userId
 * @param {number} [limit=50] - max activities to pull before grouping
 * @returns {Promise<Array<{id: string, label: string, entries: Array}>>}
 */
async function getActivityTimeline(userId, limit = 50) {
  const activities = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Group activities by their relative date label
  const groups = new Map();

  for (const activity of activities) {
    const label = getRelativeLabel(activity.createdAt);

    if (!groups.has(label)) {
      groups.set(label, []);
    }

    groups.get(label).push({
      id: activity._id,
      text: buildActivityText(activity),
      rating: activity.rating || undefined,
    });
  }

  // Convert the Map to the array the frontend expects
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
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Build a human-readable activity description for the timeline.
 */
function buildActivityText(activity) {
  switch (activity.type) {
    case "rating":
      return `Rated ${activity.title}`;
    case "review":
      return `Reviewed ${activity.title}`;
    case "watchlist_add":
      return `Added ${activity.title} to watchlist`;
    case "watchlist_remove":
      return `Removed ${activity.title} from watchlist`;
    case "watch_started":
      return `Started watching ${activity.title}`;
    case "watch_completed":
      return `Finished watching ${activity.title}`;
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
