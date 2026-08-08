// Frontend/src/lib/socket.js
// Single shared Socket.IO client instance used by WatchParty / WatchRoom.
import { io } from "socket.io-client";

// NOTE: was defaulting to :5000 — server.js listens on :5001. Set
// VITE_SOCKET_URL in your .env if you ever change the backend port.
const SOCKET_URL = import.meta.env.VITE_API_URL;

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true, // send the session cookie your /auth/me relies on
    });
  }
  return socket;
}
