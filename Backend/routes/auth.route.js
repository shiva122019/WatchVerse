const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../lib/passportUtils").genPassword;
const User = require("../Models/User.js");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info ? info.message : "Authentication failed",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});

router.post("/register", async (req, res, next) => {
  try {
    const { password, email, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hash = await genPassword(password);

    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      hash: hash,
    });

    await newUser.save();

    req.logIn(newUser, (err) => {
      if (err) return next(err);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return next(err);

      res.clearCookie("connect.sid");

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  res.status(200).json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  });
});

module.exports = router;