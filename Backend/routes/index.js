const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../lib/passportUtils").genPassword;
const connection = require("../config/db")();
const User = require("../Models/User.js");

router.post(
  "/login",
  (req, res, next) => {
    console.log("Request body:", req.body);
    next();
  },
  passport.authenticate("local", {
    failureRedirect: "/login-failure", //Automatically does req.login
    successRedirect: "/login-success",
  }),
);

router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    const hash = await genPassword(password);

    const newUser = new User({
      username: username,
      hash: hash,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index", {
      user: req.user,
      message: `Welcome back, ${req.user.username}!`,
    });
  } else {
    res.render("index", {
      user: null,
      message: "Welcome! Please log in or register to continue.",
      showAuthLinks: true,
    });
  }
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  const error = req.query.error || null;
  res.render("login", { error: error });
});

router.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  const error = req.query.error || null;
  res.render("register", { error: error });
});

router.get("/login-failure", (req, res) => {
  res.send("<h1>login has failed</h1><a href='/login'>login</a>");
});
//TODO:: logout
router.get("/login-success", (req, res) => {
  res.send(
    "<h1>you have logged in</h1><form action='/logout' method='post'><button type='submit'>logout</button></form>",
  );
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
