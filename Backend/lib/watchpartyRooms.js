// Backend/lib/watchpartyRooms.js
//
// Single shared Map instance for watch party room state. Both
// routes/watchparty.route.js (create/check a room over REST) and
// sockets/watchparty.socket.js (real-time sync) import this same module,
// so they're always looking at the same data — not two separate stores.
//
// Room shape (fields get added lazily as they're needed):
// {
//   code: string,
//   hostToken: string,
//   hostSocketId: string | null,
//   playing: boolean,
//   time: number,            // seconds of playback elapsed
//   updatedAt: number,       // Date.now() at last play/pause/seek
//   duration: number,        // total seconds, defaults to 7080 (1:58:00)
//   messages: Array<{id,name,text,ts}>,
//   participants: { [socketId]: { id, name, color, isHost } },
// }
//
// If you outgrow a single Node process (multiple server instances behind a
// load balancer), swap this for Redis — the .get/.set/.delete calls at the
// call sites won't need to change if you wrap Redis in the same Map-like API.

module.exports = new Map();