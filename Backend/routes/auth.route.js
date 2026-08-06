const router = require("express").Router();
const passport = require("passport");
const axios = require("axios");
const genPassword = require("../lib/passportUtils").genPassword;
const User = require("../Models/User.js");

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// Helper to check if a user has a valid stored Spotify refresh token
function hasSpotifyToken(user) {
  const token = user?.spotify?.refreshToken;
  return Boolean(token && typeof token === "string" && token.trim() !== "");
}

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
          onboardingCompleted: user.onboardingCompleted || false,
          spotify: user.spotify || {
            connected: false,
            id: null,
            refreshToken: null,
          },
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
          onboardingCompleted: newUser.onboardingCompleted || false,
          spotify: newUser.spotify || {
            connected: false,
            id: null,
            refreshToken: null,
          },
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
    avatar: req.user.avatar || null,
    displayName: req.user.displayName || null,
    provider: req.user.provider || "local",
    onboardingCompleted: req.user.onboardingCompleted || false,
    spotify: req.user.spotify || {
      connected: false,
      id: null,
      refreshToken: null,
    },
  });
});

// --- Google OAuth Routes ---

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${frontendUrl}/login`,
  }),
  (req, res) => {
    // 1. Check if user has connected Spotify (spotify.refreshToken exists)
    if (!hasSpotifyToken(req.user)) {
      return res.redirect(`${frontendUrl}/connect-spotify`);
    }

    // 2. Check if user has completed movie onboarding
    if (!req.user.onboardingCompleted) {
      return res.redirect(`${frontendUrl}/onBoarding`);
    }

    return res.redirect(frontendUrl);
  },
);

// --- Spotify OAuth Routes ---

// 1. Initiate Spotify Authorization Flow
router.get("/spotify", (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      success: false,
      message: "User must be authenticated to connect Spotify",
    });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ||
    "http://localhost:5001/auth/spotify/callback";

  const scope = [
    "user-read-private",
    "user-read-email",
    "user-read-recently-played",
    "user-top-read",
  ].join(" ");

  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: req.user._id.toString(),
      show_dialog: "true",
    }).toString();

  res.redirect(authUrl);
});

// 2. Spotify OAuth Callback Endpoint
router.get("/spotify/callback", async (req, res, next) => {
  try {
    const { code, error, state } = req.query;

    if (error) {
      return res.redirect(
        `${frontendUrl}/connect-spotify?error=${encodeURIComponent(error)}`,
      );
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/connect-spotify?error=missing_code`);
    }

    // Resolve authenticated WatchVerse user: from req.user OR state fallback
    let targetUser = req.user;

    if (!targetUser && state) {
      targetUser = await User.findById(state);
      if (targetUser) {
        await new Promise((resolve, reject) => {
          req.logIn(targetUser, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }

    if (!targetUser) {
      return res.redirect(`${frontendUrl}/login?error=session_expired`);
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri =
      process.env.SPOTIFY_REDIRECT_URI ||
      "http://localhost:5001/auth/spotify/callback";

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    // Step A: Exchange authorization code for access token and refresh token
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Step B: Fetch Spotify profile using GET /me
    const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const spotifyUser = profileResponse.data;

    // Step C: Save spotify.id and spotify.refreshToken into target WatchVerse user
    const user = await User.findById(targetUser._id);
    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=user_not_found`);
    }

    user.spotify = {
      connected: true,
      id: spotifyUser.id,
      refreshToken: refresh_token || user.spotify?.refreshToken || null,
    };

    await user.save();

    // Ensure session is saved to store before redirecting
    await new Promise((resolve) => req.session.save(resolve));

    // Step D: Redirect user based on onboardingCompleted status
    if (!user.onboardingCompleted) {
      return res.redirect(`${frontendUrl}/onBoarding`);
    }

    return res.redirect(frontendUrl);
  } catch (err) {
    console.error(
      "Spotify OAuth Callback Error:",
      err.response?.data || err.message,
    );
    const errorMsg =
      err.response?.data?.error_description ||
      err.response?.data?.error ||
      "Failed to link Spotify account";
    return res.redirect(
      `${frontendUrl}/connect-spotify?error=${encodeURIComponent(errorMsg)}`,
    );
  }
});

// 3. Disconnect Spotify (satisfies requirement 5)
router.post("/spotify/disconnect", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.spotify = {
        connected: false,
        id: null,
        refreshToken: null,
      };
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Spotify account disconnected successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to disconnect Spotify",
    });
  }
});

module.exports = router;
