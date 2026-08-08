const CreatorPost = require("../Models/CreatorPost");
const PostAnalytic = require("../Models/PostAnalytic");
const Follow = require("../Models/Follow");
const AppError = require("../lib/AppError");

/**
 * Get all creator posts for a user, grouped by their format/type.
 *
 * @param {string} userId
 * @returns {Promise<{fullMovies: Array, shortMovies: Array, trailers: Array, webSeries: Array, music: Array}>}
 */
async function getCreatorPosts(userId) {
  const posts = await CreatorPost.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  const grouped = {
    movies: [],
    music: [],
  };

  for (const post of posts) {
    const key = post.type === "music" ? "music" : "movies";

    grouped[key].push({
      id: post._id,
      title: post.title,
      type: post.type,
      format: post.format,
      category: post.category || [],
      thumbUrl: post.thumbUrl || null,
      videoUrl: post.videoUrl || null,
      audioUrl: post.audioUrl || null,
      duration: post.duration || 0,
      date: post.createdAt,
      views: post.views || 0,
      watchTime: post.watchTime || 0,
    });
  }

  return grouped;
}

/**
 * Get aggregated stats for a creator (total views, total watch time) and social stats
 *
 * @param {string} userId
 * @returns {Promise<{totalViews: number, totalWatchTime: number, totalPosts: number, followers: number, following: number}>}
 */
async function getCreatorStats(userId) {
  const mongoose = require("mongoose");
  
  const [posts, followerCount, followingCount] = await Promise.all([
    CreatorPost.find({ userId: new mongoose.Types.ObjectId(userId) }).lean(),
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
  ]);

  let totalViews = 0;
  let totalWatchTime = 0;
  let totalPosts = posts.length;
  const uniqueViewersSet = new Set();

  for (const post of posts) {
    totalViews += post.views || 0;
    totalWatchTime += post.watchTime || 0;
    if (post.uniqueViewers) {
      post.uniqueViewers.forEach(v => uniqueViewersSet.add(v));
    }
  }

  const baseStats = {
    totalViews,
    totalWatchTime,
    totalPosts,
    uniqueViewers: uniqueViewersSet.size
  };

  // Fetch real analytics from the database for the last 365 days
  const now = new Date();
  const pastYear = new Date();
  pastYear.setDate(now.getDate() - 365);
  const pastYearString = pastYear.toISOString().split("T")[0];

  const analytics = await PostAnalytic.aggregate([
    {
      $match: {
        creatorId: new mongoose.Types.ObjectId(userId),
        date: { $gte: pastYearString }
      }
    },
    {
      $group: {
        _id: "$date",
        views: { $sum: "$views" },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Convert raw analytics into a lookup map: { "YYYY-MM-DD": views }
  const analyticsMap = {};
  analytics.forEach(a => {
    analyticsMap[a._id] = a.views;
  });

  const daily = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    
    daily.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: analyticsMap[dateStr] || 0
    });
  }

  // Generate 24 hour data
  const todayStr = new Date().toISOString().split("T")[0];
  const todayViews = analyticsMap[todayStr] || 0;
  const hourly = [];
  let remainingViews = todayViews;
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i);
    
    const hViews = i === 0 ? remainingViews : Math.floor(todayViews / 24);
    remainingViews -= hViews;
    
    hourly.push({
      date: d.toLocaleTimeString('en-US', { hour: 'numeric' }),
      views: hViews > 0 ? hViews : 0
    });
  }

  return {
    ...baseStats,
    followers: followerCount,
    following: followingCount,
    viewsTimeSeries: {
      '1d': hourly,
      '7d': daily.slice(-7),
      '30d': daily.slice(-30),
      '1y': daily,
    },
  };
}

/**
 * Create a new creator post.
 *
 * @param {{userId: string, type: string, format?: string, category: string[], title: string, thumbUrl?: string, videoUrl?: string, audioUrl?: string}} data
 * @returns {Promise<import("mongoose").Document>}
 */
async function createPost(data) {
  const { userId, type, format, category, title, thumbUrl, videoUrl, audioUrl, duration } = data;

  if (!title || !title.trim()) {
    throw new AppError("Post title is required", 400);
  }

  if (!["movie", "music"].includes(type)) {
    throw new AppError(
      "Type must be movie or music",
      400,
    );
  }

  const post = await CreatorPost.create({
    userId,
    type,
    format: type === "movie" ? (format || "full movie") : "music",
    category: Array.isArray(category) ? category : [],
    title,
    thumbUrl,
    videoUrl,
    audioUrl,
    duration: duration || 0,
    views: 0,
    watchTime: 0,
  });
  
  return post;
}

/**
 * Update an existing creator post.
 *
 * @param {string} postId
 * @param {string} userId - for ownership check
 * @param {{title?: string, category?: string, thumbUrl?: string}} updates
 * @returns {Promise<import("mongoose").Document>}
 */
async function updatePost(postId, userId, updates) {
  const post = await CreatorPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new AppError("You can only edit your own posts", 403);
  }

  if (updates.title !== undefined) post.title = updates.title.trim();
  if (updates.category !== undefined) {
    if (!["trailer", "announcement", "latestRelease"].includes(updates.category)) {
      throw new AppError(
        "Category must be trailer, announcement, or latestRelease",
        400,
      );
    }
    post.category = updates.category;
  }
  if (updates.thumbUrl !== undefined) post.thumbUrl = updates.thumbUrl;

  return post.save();
}

/**
 * Delete a creator post.
 *
 * @param {string} postId
 * @param {string} userId - for ownership check
 */
async function deletePost(postId, userId) {
  const post = await CreatorPost.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new AppError("You can only delete your own posts", 403);
  }

  await post.deleteOne();
  return true;
}

/**
 * Increment view count and watch time for a specific post.
 * 
 * @param {string} postId
 * @param {number} watchTimeIncrement (in seconds)
 */
async function incrementView(postId, watchTimeIncrement = 0, viewerId = null) {
  const post = await CreatorPost.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  // Update total post stats
  post.views += 1;
  post.watchTime += watchTimeIncrement;
  
  if (viewerId && viewerId !== "unknown" && !post.uniqueViewers.includes(viewerId)) {
    post.uniqueViewers.push(viewerId);
  }
  
  await post.save();

  // Update daily analytics
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  await PostAnalytic.findOneAndUpdate(
    { postId: post._id, date: today },
    {
      $setOnInsert: { creatorId: post.userId },
      $inc: { views: 1, watchTime: watchTimeIncrement },
    },
    { upsert: true, new: true }
  );

  return post;
}

module.exports = {
  CreatorPost,
  getCreatorPosts,
  getCreatorStats,
  createPost,
  updatePost,
  deletePost,
  incrementView,
};
