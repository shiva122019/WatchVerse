const express = require("express");
const crypto = require("crypto");
const rooms = require("../lib/watchpartyRooms");
const tmdb = require("../services/tmdb.service");

const router = express.Router();

// Used by GET /surprise when the room hasn't agreed on any genres yet —
// keeps "Surprise us" a true one-tap action instead of requiring the
// genre picker first.
const DEFAULT_SURPRISE_GENRES = ["Action", "Comedy", "Drama", "Thriller"];

function makeRoomCode() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST /watchparty/rooms — create a new room, returns the code + a private
// host token (the client keeps this in sessionStorage, never in the URL).
router.post("/rooms", (req, res) => {
  const code = makeRoomCode();
  const hostToken = crypto.randomBytes(16).toString("hex");
  rooms.set(code, {
    code,
    hostToken,
    hostSocketId: null,
    playing: false,
    time: 0,
    movie: null,
    participants: {},
  });
  res.json({ roomCode: code, hostToken });
});

// GET /watchparty/rooms/:code — lets the frontend check a room exists
// before trying to join it.
router.get("/rooms/:code", (req, res) => {
  const room = rooms.get(req.params.code.toLowerCase());
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({
    code: room.code,
    playing: room.playing,
    time: room.time,
    movie: room.movie,
    participantCount: Object.keys(room.participants).length,
  });
});

// GET /watchparty/search?query=... — movie/show search for the "pick a
// movie" modal inside a room. Thin wrapper around the existing TMDB service.
router.get("/search", async (req, res) => {
  const query = (req.query.query || "").trim();
  if (!query) return res.json({ results: [] });

  try {
    const results = await tmdb.searchTitle(query);
    res.json({
      results: results.slice(0, 12).map((r) => ({
        id: r.id,
        mediaType: r.media_type,
        title: r.title || r.name,
        year: (r.release_date || r.first_air_date || "").slice(0, 4),
        posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
      })),
    });
  } catch (err) {
    console.error("TMDB search failed:", err.message);
    res.status(502).json({ error: "Search failed. Try again in a moment." });
  }
});

// GET /watchparty/genres — full genre list for the picker UI
router.get("/genres", async (req, res) => {
  try {
    const genres = await tmdb.getGenres();
    res.json({ genres: genres.map((g) => g.name) });
  } catch (err) {
    console.error("Failed to fetch genres:", err.message);
    res.status(502).json({ error: "Couldn't load genres. Try again in a moment." });
  }
});

// GET /watchparty/suggestions?genres=Action,Comedy — top-rated + latest
// titles per genre, used to populate the suggestions panel inside a room.
router.get("/suggestions", async (req, res) => {
  const genresParam = (req.query.genres || "").trim();
  if (!genresParam) return res.json({ suggestions: [] });

  const genreNames = genresParam.split(",").map((g) => g.trim()).filter(Boolean);

  try {
    const suggestions = await tmdb.discoverByGenres(genreNames);
    res.json({ suggestions });
  } catch (err) {
    console.error("Failed to fetch suggestions:", err.message);
    res.status(502).json({ error: "Couldn't load suggestions. Try again in a moment." });
  }
});

// GET /watchparty/surprise?genres=Action,Comedy — one random, well-rated,
// recent title across the combined genre pool. Genres are optional here:
// if the room hasn't picked any yet, we fall back to a default pool so
// "Surprise us" works as a standalone one-tap action, not just something
// that follows the genre picker.
router.get("/surprise", async (req, res) => {
  const genresParam = (req.query.genres || "").trim();
  const genreNames = genresParam
    ? genresParam.split(",").map((g) => g.trim()).filter(Boolean)
    : DEFAULT_SURPRISE_GENRES;

  try {
    const pick = await tmdb.getSurprisePick(genreNames);
    if (!pick) {
      return res.status(404).json({ error: "Couldn't find a match. Try different genres." });
    }
    res.json({ pick });
  } catch (err) {
    console.error("Failed to get surprise pick:", err.message);
    res.status(502).json({ error: "Couldn't get a surprise pick. Try again in a moment." });
  }
});

// GET /watchparty/posters — a batch of trending poster images, used only
// to build the mosaic background on the watch-party landing page.
router.get("/posters", async (req, res) => {
  try {
    const posters = await tmdb.getTrendingPosters(30);
    res.json({ posters });
  } catch (err) {
    console.error("Failed to fetch posters:", err.message);
    res.status(502).json({ error: "Couldn't load posters." });
  }
});

// NOTE: trailer/video lookup (GET /watchparty/trailer/:mediaType/:id) is
// intentionally left out for now — will be added once we wire up the
// actual synced player. For now "select-movie" just stores the title's
// metadata (id, name, poster) so the room agrees on what's chosen.

module.exports = router;