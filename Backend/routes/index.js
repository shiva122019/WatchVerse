const router = require("express").Router();

router.use("/auth", require("./auth.route.js"));
router.use("/home", require("./home.route.js"));
router.use("/watchlist", require("./watchlist.route.js"));
router.use("/content", require("./movieContent.route.js"));
router.use("/reviews", require("./reviews.route.js"));
module.exports = router;
