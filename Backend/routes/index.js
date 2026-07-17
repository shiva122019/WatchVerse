const router = require("express").Router();

router.use("/auth", require("./auth.route.js"));
router.use("/home", require("./home.route.js"));
router.use("/watchlist", require("./watchlist.route.js"));
router.use("/chat", require("./chat.route"));

module.exports = router;
