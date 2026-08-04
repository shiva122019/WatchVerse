const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../Models/User.js");
const validPassword = require("../lib/passportUtils.js").validPassword;

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

//done(error-401 invalid, )

const verifyCallBack = (email, password, done) => {
  //console.log("Email received:", email);

  User.findOne({ email: email.trim() })
    .then((user) => {
      //console.log("User found:", user);

      if (!user) {
        return done(null, false, {
          message: "Invalid username or password",
        });
      }

      validPassword(password, user.hash).then((isValid) => {
        //console.log("Password valid:", isValid);

        if (isValid) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: "Invalid username or password",
          });
        }
      });
    })
    .catch((e) => {
      //console.error(e);
      done(e);
    });
};

const strategy = new localStrategy(customFields, verifyCallBack);

passport.use(strategy);

// --- Google OAuth 2.0 Strategy ---

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const avatar = profile.photos?.[0]?.value || null;
      const displayName = profile.displayName || null;

      // 1. Already linked via googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      // 2. Same email exists — link Google to that account
      user = await User.findOne({ email });
      if (user) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = avatar;
        if (!user.displayName) user.displayName = displayName;
        await user.save();
        return done(null, user);
      }

      // 3. Brand-new user — auto-generate a unique username
      let baseUsername = (displayName || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      let username = baseUsername;
      let suffix = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}-${suffix++}`;
      }

      const newUser = new User({
        username,
        email,
        googleId: profile.id,
        provider: "google",
        avatar,
        displayName,
      });
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  },
);

passport.use(googleStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch((e) => done(e));
});

