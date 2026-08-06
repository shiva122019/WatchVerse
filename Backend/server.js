const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
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
const watchpartyRoutes = require("./routes/watchparty.route");
const registerWatchPartySockets = require("./sockets/watchparty.socket");

const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS must be registered before any routes so every response —
// including /watchparty/* — actually gets the Access-Control-Allow-*
// headers the browser needs. Mounting routes before this was the bug:
// requests to /watchparty/rooms got a response with no CORS headers,
// so the browser blocked it and fetch() threw "Failed to fetch".
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

// Routes (mounted once, after CORS/session/passport are set up)
app.use("/", routes);
app.use("/watchparty", watchpartyRoutes);

app.use(errorHandler);

// --- Socket.io needs a raw http server wrapping the Express app ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

registerWatchPartySockets(io);

server.listen(5001, () => {
  console.log("Server started on port 5001");
});
