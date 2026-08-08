const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const passport = require("passport");
const cors = require("cors");

const errorHandler = require("./lib/errorHandler.js");

require("dotenv").config();

const routes = require("./routes");
const connectDb = require("./config/db");
const watchpartyRoutes = require("./routes/watchparty.route");
const registerWatchPartySockets = require("./sockets/watchparty.socket");

const app = express();

const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!process.env.MONGO_URL) {
  throw new Error("MONGO_URL is not defined");
}

if (!process.env.SECRET) {
  throw new Error("SECRET is not defined");
}

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not defined");
}

// Needed when running behind Render/Railway/etc.
// so secure cookies work correctly behind the proxy.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost during development
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Database
// ─────────────────────────────────────────────────────────────────────────────

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "Sessions",
});

// ─────────────────────────────────────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  session({
    secret: process.env.SECRET,

    resave: false,

    saveUninitialized: false,

    store: sessionStore,

    cookie: {
      maxAge: 1000 * 60 * 60 * 24,

      httpOnly: true,

      // Production frontend/backend are commonly on different sites.
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      secure: process.env.NODE_ENV === "production",
    },
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Passport
// ─────────────────────────────────────────────────────────────────────────────

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.use("/", routes);

app.use("/watchparty", watchpartyRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// HTTP + Socket.IO
// ─────────────────────────────────────────────────────────────────────────────

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

registerWatchPartySockets(io);

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  try {
    await connectDb();

    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log(`Frontend: ${FRONTEND_URL}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
