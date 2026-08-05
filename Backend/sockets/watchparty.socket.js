// Backend/sockets/watchparty.socket.js
const rooms = require("../lib/watchpartyRooms");
const tmdb = require("../services/tmdb.service");
const AVATAR_COLORS = ["#5CF2E3", "#f472b6", "#a78bfa", "#fb7185", "#fbbf24", "#60a5fa", "#34d399"];

function colorFor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function participantList(room) {
  return Object.values(room.participants);
}

// Elapsed playback time accounting for time passed since the last update
function getElapsedTime(room) {
  if (!room.playing) return room.time;
  return room.time + (Date.now() - room.updatedAt) / 1000;
}

function leaveCurrentRoom(io, socket) {
  const code = socket.data.roomCode;
  if (!code) return;

  const room = rooms.get(code);
  if (!room) return;

  delete room.participants[socket.id];
  socket.leave(code);

  // clean up this participant's genre pick and re-broadcast
  if (room.genrePicks) {
    delete room.genrePicks[socket.id];
    const allGenres = Array.from(new Set(Object.values(room.genrePicks).flat()));
    io.to(code).emit("genre-picks-update", { picks: room.genrePicks, allGenres });
  }

  if (room.hostSocketId === socket.id) {
    room.hostSocketId = null;
  }

  io.to(code).emit("user-left", { id: socket.id, name: socket.data.name });
  io.to(code).emit("people-update", participantList(room));

  if (Object.keys(room.participants).length === 0) {
    rooms.delete(code);
  }

  socket.data.roomCode = null;
}

module.exports = function registerWatchPartySocket(io) {
  io.on("connection", (socket) => {
    // ---- join a room created via POST /watchparty/rooms ----
    socket.on("join-room", ({ roomCode, name, hostToken }) => {
      if (!roomCode || !name) return;
      const code = String(roomCode).toLowerCase();

      const room = rooms.get(code);
      if (!room) {
        socket.emit("join-error", { message: "Room not found." });
        return;
      }

      // fields the REST route doesn't set up front — add them on first join
      room.updatedAt = room.updatedAt || Date.now();
      room.duration = room.duration || 7080; // 1:58:00 placeholder
      room.messages = room.messages || [];
      room.participants = room.participants || {};
      room.movie = room.movie || null;
      room.genrePicks = room.genrePicks || {};

      const isHost = !!hostToken && hostToken === room.hostToken;
      if (isHost) room.hostSocketId = socket.id;

      const user = {
        id: socket.id,
        name,
        color: colorFor(Object.keys(room.participants).length),
        isHost,
      };
      room.participants[socket.id] = user;

      socket.join(code);
      socket.data.roomCode = code;
      socket.data.name = name;

      // full current state, only to the joining client
      socket.emit("room-state", {
        people: participantList(room),
        messages: room.messages.slice(-50),
        playing: room.playing,
        currentTime: getElapsedTime(room),
        duration: room.duration,
        movie: room.movie,
        genrePicks: room.genrePicks,
      });

      socket.to(code).emit("user-joined", user);
      io.to(code).emit("people-update", participantList(room));
    });

    // ---- genre picks (each participant contributes, room state syncs) ----
    socket.on("select-genres", ({ roomCode, genres }) => {
      const code = String(roomCode).toLowerCase();
      const room = rooms.get(code);
      if (!room || !Array.isArray(genres)) return;

      room.genrePicks = room.genrePicks || {};
      room.genrePicks[socket.id] = genres;

      const allGenres = Array.from(new Set(Object.values(room.genrePicks).flat()));

      io.to(code).emit("genre-picks-update", {
        picks: room.genrePicks,
        allGenres,
      });
    });

    // ---- pick / change what's playing ----
    socket.on("select-movie", async ({ roomCode, movie }) => {
      const code = String(roomCode).toLowerCase();
      const room = rooms.get(code);
      if (!room || !movie) return;

      let trailerKey = null;
      try {
        trailerKey = await tmdb.getVideos(movie.id, movie.mediaType);
      } catch (err) {
        console.error("Failed to fetch trailer:", err.message);
      }

      room.movie = { ...movie, trailerKey }; // now carries trailerKey for playback
      room.playing = false;
      room.time = 0;
      room.updatedAt = Date.now();

      io.to(code).emit("movie-selected", {
        movie: room.movie,
        by: socket.data.name || "Someone",
      });
    });

    // ---- play / pause ----
    socket.on("play-pause", ({ roomCode, playing }) => {
      const code = String(roomCode).toLowerCase();
      const room = rooms.get(code);
      if (!room) return;

      room.time = getElapsedTime(room);
      room.playing = !!playing;
      room.updatedAt = Date.now();

      io.to(code).emit("play-state", {
        playing: room.playing,
        currentTime: room.time,
        by: socket.data.name || "Someone",
      });
    });

    // ---- seek ----
    socket.on("seek", ({ roomCode, time }) => {
      const code = String(roomCode).toLowerCase();
      const room = rooms.get(code);
      if (!room || typeof time !== "number") return;

      room.time = Math.max(0, time);
      room.updatedAt = Date.now();

      io.to(code).emit("seek-update", {
        currentTime: room.time,
        by: socket.data.name || "Someone",
      });
    });

    // ---- chat ----
    socket.on("chat-message", ({ roomCode, name, text }) => {
      const code = String(roomCode).toLowerCase();
      const room = rooms.get(code);
      if (!room || !text || !text.trim()) return;

      room.messages = room.messages || [];
      const msg = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name || socket.data.name || "Guest",
        text: text.trim().slice(0, 500),
        ts: Date.now(),
      };
      room.messages.push(msg);
      if (room.messages.length > 200) room.messages.shift();

      io.to(code).emit("chat-message", msg);
    });

    // ---- reactions ----
    socket.on("reaction", ({ roomCode, emoji }) => {
      const code = String(roomCode).toLowerCase();
      const room = rooms.get(code);
      if (!room || !emoji) return;

      io.to(code).emit("reaction", { emoji, by: socket.data.name || "Someone" });
    });

    // ---- leave / disconnect ----
    socket.on("leave-room", () => leaveCurrentRoom(io, socket));
    socket.on("disconnect", () => leaveCurrentRoom(io, socket));
  });
};