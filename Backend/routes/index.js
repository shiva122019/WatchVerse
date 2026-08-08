const router = require("express").Router();

// Existing routes
router.use("/auth", require("./auth.route.js"));
router.use("/home", require("./home.route.js"));
router.use("/watchlist", require("./watchlist.route.js"));
router.use("/chat", require("./chat.route"));
router.use("/content", require("./movieContent.route.js"));
router.use("/reviews", require("./reviews.route.js"));
router.use("/comments", require("./comments.route.js"));
router.use("/onboarding", require("./onboarding.route.js"));
router.use("/karaoke", require("./karaoke.route.js"));

// Profile & related sub-routes
router.use("/profile", require("./profile.route.js"));
router.use("/profile", require("./profile.reviews.route.js"));
router.use("/profile", require("./profile.activity.route.js"));
router.use("/profile", require("./profile.favorites.route.js"));
router.use("/profile", require("./profile.watchlist.route.js"));

// Follow & social relationships
router.use("/follow", require("./follow.route.js"));
router.use("/", require("./follow.route.js")); // for /followers/:username and /following/:username

// Creator content
router.use("/creator", require("./creator.route.js"));

// Spotify profile integration
router.use("/spotify", require("./spotify.profile.route.js"));
router.use("/spotify", require("./spotify.personalization.route.js"));


module.exports = router;
