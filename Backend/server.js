const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const passport = require("passport");
const bcrypt = require("bcrypt");
const cors = require("cors");
const errorHandler = require("./lib/errorHandler.js");
require("dotenv").config();

const routes = require("./routes");
const connectDb = require("./config/db");

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

connectDb();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "Sessions",
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  }),
);

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  next();
});

app.use("/", routes);

app.use(errorHandler);

app.listen(5001, () => {
  console.log("Server started on port 5001");
});
