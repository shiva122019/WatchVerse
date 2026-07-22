const router = require("express").Router();

router.use("/auth", require("./auth.route.js"));
router.use("/home", require("./home.route.js"));
router.use("/watchlist", require("./watchlist.route.js"));
router.use("/content", require("./movieContent.route.js"));
router.use("/reviews", require("./reviews.route.js"));
router.use("/chat", require("./chat.route"));
router.use("/comments", require("./comments.route.js"));
router.use("/onboarding", require("./onboarding.route.js"));
module.exports = router;
