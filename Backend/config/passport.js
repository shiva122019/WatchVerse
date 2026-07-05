const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const connectdb = require("./db.js");
const User = require("../Models/User.js");
const validPassword = require("../lib/passportUtils.js").validPassword;
connectdb();

const customFields = {
  usernameField: "username",
  passwordField: "password",
};

//done(error-401 invalid, )

const verifyCallBack = (username, password, done) => {
  console.log("username:", username);
  console.log("password:", password);

  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return done(null, false, {
          message: "Invalid username or password",
        });
      }
      validPassword(password, user.hash).then((isValid) => {
        console.log(isValid);
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
