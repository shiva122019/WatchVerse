const CreatorPost = require("../Models/CreatorPost");
const AppError = require("../lib/AppError");

/**
 * Get all creator posts for a user, grouped by category to match the
 * frontend shape: { trailers: [...], announcements: [...], latestReleases: [...] }
 *
 * @param {string} userId
 * @returns {Promise<{trailers: Array, announcements: Array, latestReleases: Array}>}
 */
async function getCreatorPosts(userId) {
  const posts = await CreatorPost.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  const grouped = {
    trailers: [],
    announcements: [],
    latestReleases: [],
  };

  // Map DB category enum values to the frontend's expected keys
  const categoryKeyMap = {
    trailer: "trailers",
    announcement: "announcements",
    latestRelease: "latestReleases",
  };

  for (const post of posts) {
    const key = categoryKeyMap[post.category];
    if (key) {
      grouped[key].push({
        id: post._id,
        title: post.title,
        thumbUrl: post.thumbUrl || null,
        date: post.createdAt,
      });
    }
  }

  return grouped;
}

/**
 * Create a new creator post.
 *
 * @param {{userId: string, category: string, title: string, thumbUrl?: string}} data
 * @returns {Promise<import("mongoose").Document>}
 */
async function createPost(data) {
  const { userId, category, title, thumbUrl } = data;

  if (!title || !title.trim()) {
    throw new AppError("Post title is required", 400);
  }

  if (!["trailer", "announcement", "latestRelease"].includes(category)) {
    throw new AppError(
      "Category must be trailer, announcement, or latestRelease",
      400,
    );
  }

  return CreatorPost.create({
    userId,
    category,
    title: title.trim(),
    thumbUrl: thumbUrl || null,
  });
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
}

module.exports = {
  getCreatorPosts,
  createPost,
  updatePost,
  deletePost,
};
