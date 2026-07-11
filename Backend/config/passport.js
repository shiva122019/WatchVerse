const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
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
