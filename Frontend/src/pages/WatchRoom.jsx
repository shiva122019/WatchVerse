// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Check, LogOut, Users, MessageCircle, Film, Sparkles, Search, Shuffle, ArrowLeft, UserPlus } from "lucide-react";
// import { getSocket } from "@/lib/socket";
// import ParticipantsList from "@/components/watchparty/ParticipantsList";
// import ChatPanel from "@/components/watchparty/ChatPanel";
// import ReactionBar, { ReactionOverlay } from "@/components/watchparty/ReactionBar";
// import MovieSearchModal from "@/components/watchparty/MovieSearchModal";
// import TrailerPlayer from "@/components/watchparty/TrailerPlayer";
// import GenreSelectModal from "@/components/watchparty/GenreSelectModal";
// import SuggestionsPanel from "@/components/watchparty/SuggestionsPanel";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// export default function WatchRoom() {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const socketRef = useRef(null);

//   const [name, setName] = useState(() => sessionStorage.getItem("wp_name") || "");
//   const [nameDraft, setNameDraft] = useState("");
//   const [joined, setJoined] = useState(false);
//   const [joinError, setJoinError] = useState("");

//   const [people, setPeople] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [movie, setMovie] = useState(null);
//   const [tab, setTab] = useState("chat"); // "chat" | "people"
//   const [showSearch, setShowSearch] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [incomingReaction, setIncomingReaction] = useState(null);

//   // Genre / suggestions flow
//   const [genrePicks, setGenrePicks] = useState({}); // { socketId: [genres] }
//   const [myGenres, setMyGenres] = useState(null); // null = haven't picked yet
//   const [showGenreModal, setShowGenreModal] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(false);

//   // "Surprise us" is a standalone one-tap action — it doesn't go through
//   // the genre modal at all. It uses whatever genres the room has already
//   // picked (if any); otherwise the backend falls back to a broad default
//   // pool, so this never blocks on a 400.
//   const [surprising, setSurprising] = useState(false);
//   const [surpriseError, setSurpriseError] = useState("");

//   // Synced playback state — driven by the room, not local component state
//   const [syncedPlaying, setSyncedPlaying] = useState(false);
//   const [syncedTime, setSyncedTime] = useState(0);
//   const [seekVersion, setSeekVersion] = useState(0);

//   // Uses window.location.origin, so on a local dev server this naturally
//   // resolves to http://localhost:<port>/watch-room/<roomId>.
//   const shareLink = `${window.location.origin}/watch-room/${roomId}`;

//   useEffect(() => {
//     if (!name) return;

//     const socket = getSocket();
//     socketRef.current = socket;
//     socket.connect();

//     const hostToken = sessionStorage.getItem(`wp_host_${roomId}`) || null;

//     const onRoomState = (state) => {
//       setPeople(state.people || []);
//       setMessages(state.messages || []);
//       setMovie(state.movie || null);
//       setSyncedPlaying(state.playing || false);
//       setSyncedTime(state.currentTime || 0);
//       setGenrePicks(state.genrePicks || {});
//       setJoined(true);
//       setJoinError("");
//     };
//     const onJoinError = (err) => setJoinError(err.message || "Couldn't join this room.");
//     const onPeopleUpdate = (list) => setPeople(list);
//     const onChatMessage = (msg) => setMessages((prev) => [...prev, msg]);
//     const onMovieSelected = ({ movie: m }) => {
//       setMovie(m);
//       setSyncedTime(0);
//       setSeekVersion(0);
//       setSyncedPlaying(true);
//       socketRef.current?.emit("play-pause", { roomCode: roomId, playing: true });
//     };
//     const onPlayState = ({ playing }) => setSyncedPlaying(playing);
//     const onSeekUpdate = ({ currentTime }) => {
//       setSyncedTime(currentTime);
//       setSeekVersion((v) => v + 1);
//     };
//     const onReaction = (payload) => setIncomingReaction(payload);
//     const onGenrePicksUpdate = ({ picks }) => setGenrePicks(picks || {});

//     socket.on("room-state", onRoomState);
//     socket.on("join-error", onJoinError);
//     socket.on("people-update", onPeopleUpdate);
//     socket.on("chat-message", onChatMessage);
//     socket.on("movie-selected", onMovieSelected);
//     socket.on("play-state", onPlayState);
//     socket.on("seek", onSeekUpdate);
//     socket.on("reaction", onReaction);
//     socket.on("genre-picks-update", onGenrePicksUpdate);

//     socket.on("connect", () => {
//       socket.emit("join-room", { roomCode: roomId, name, hostToken });
//     });

//     return () => {
//       socket.emit("leave-room");
//       socket.off("room-state", onRoomState);
//       socket.off("join-error", onJoinError);
//       socket.off("people-update", onPeopleUpdate);
//       socket.off("chat-message", onChatMessage);
//       socket.off("movie-selected", onMovieSelected);
//       socket.off("play-state", onPlayState);
//       socket.off("seek", onSeekUpdate);
//       socket.off("reaction", onReaction);
//       socket.off("genre-picks-update", onGenrePicksUpdate);
//       socket.disconnect();
//     };
//   }, [name, roomId]);

//   const submitName = (e) => {
//     e.preventDefault();
//     const trimmed = nameDraft.trim();
//     if (!trimmed) return;
//     sessionStorage.setItem("wp_name", trimmed);
//     setName(trimmed);
//   };

//   const leaveRoom = () => {
//     socketRef.current?.emit("leave-room");
//     socketRef.current?.disconnect();
//     navigate("/watchparty");
//   };

//   const copyLink = async () => {
//     await navigator.clipboard.writeText(shareLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1800);
//   };

//   const sendChat = (text) => {
//     socketRef.current?.emit("chat-message", { roomCode: roomId, name, text });
//   };

//   const sendReaction = (emoji) => {
//     socketRef.current?.emit("reaction", { roomCode: roomId, emoji });
//   };

//   const selectMovie = (result) => {
//     socketRef.current?.emit("select-movie", {
//       roomCode: roomId,
//       movie: {
//         id: result.id,
//         mediaType: result.mediaType,
//         title: result.title,
//         posterUrl: result.posterUrl,
//       },
//     });
//     setShowSearch(false);
//     setShowSuggestions(false);
//   };

//   const submitGenres = (genres) => {
//     setMyGenres(genres);
//     socketRef.current?.emit("select-genres", { roomCode: roomId, genres });
//     setShowGenreModal(false);
//     setShowSuggestions(true);
//   };

//   // Bypasses the genre modal entirely. Uses whatever genres the room has
//   // already agreed on (from genrePicks); if nobody has picked any yet, the
//   // query param is just omitted and the backend applies its own default
//   // pool, so this always resolves to a pick.
//   const surpriseUs = async () => {
//     setSurprising(true);
//     setSurpriseError("");
//     try {
//       const roomGenres = Array.from(new Set(Object.values(genrePicks).flat()));
//       const url = roomGenres.length
//         ? `${API_BASE}/watchparty/surprise?genres=${encodeURIComponent(roomGenres.join(","))}`
//         : `${API_BASE}/watchparty/surprise`;
//       const res = await fetch(url);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Couldn't get a surprise pick");
//       if (data.pick) selectMovie(data.pick);
//     } catch (err) {
//       setSurpriseError(err.message || "Couldn't get a surprise pick. Try again.");
//     } finally {
//       setSurprising(false);
//     }
//   };

//   const requestPlayPause = (playing) => {
//     socketRef.current?.emit("play-pause", { roomCode: roomId, playing });
//   };

//   const requestSeek = (time) => {
//     socketRef.current?.emit("seek", { roomCode: roomId, time });
//   };

//   if (!name) {
//     return (
//       <div className="flex h-screen items-center justify-center overflow-hidden bg-[#050505] px-6">
//         <form
//           onSubmit={submitName}
//           className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
//         >
//           <span className="label-caps text-xs tracking-[0.3em]" style={{ color: "#5CF2E3" }}>
//             Joining a room
//           </span>
//           <h1 className="font-display mt-3 text-2xl font-semibold text-white">
//             What should we call you?
//           </h1>
//           <input
//             autoFocus
//             value={nameDraft}
//             onChange={(e) => setNameDraft(e.target.value)}
//             placeholder="Your name"
//             maxLength={24}
//             className="mt-6 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-center text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#5CF2E3]/50"
//           />
//           <button
//             type="submit"
//             disabled={!nameDraft.trim()}
//             className="mt-4 w-full rounded-full py-3 font-semibold text-black disabled:opacity-40"
//             style={{ backgroundColor: "#5CF2E3" }}
//           >
//             Enter room
//           </button>
//         </form>
//       </div>
//     );
//   }

//   if (joinError) {
//     return (
//       <div className="flex h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#050505] px-6 text-center">
//         <p className="text-lg text-white">{joinError}</p>
//         <button
//           onClick={() => navigate("/watchparty")}
//           className="rounded-full px-6 py-3 font-semibold text-black"
//           style={{ backgroundColor: "#5CF2E3" }}
//         >
//           Host a new watch party
//         </button>
//       </div>
//     );
//   }

//   if (!joined) {
//     return (
//       <div className="flex h-screen items-center justify-center overflow-hidden bg-[#050505] text-neutral-400">
//         Joining room…
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen flex-col overflow-hidden bg-[#050505] text-white">
//       <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate("/watchparty")}
//             aria-label="Back"
//             className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </button>
//           <h1 className="text-lg font-semibold text-white">{movie?.title || "Watch party"}</h1>
//           {movie && (
//             <span className="flex items-center gap-1.5 rounded-full border border-[#5CF2E3]/25 bg-[#5CF2E3]/10 px-3 py-1 text-xs font-medium text-[#5CF2E3]">
//               <Shuffle className="h-3 w-3" />
//               {people.length > 1 ? "Both synced" : "Synced"}
//             </span>
//           )}
//         </div>

//         {/* Invite + leave now live together here — this is the single,
//             persistent place for both actions. The old floating copies of
//             these that used to sit on top of the video were removed so
//             there's only one source of truth and no visual clash with the
//             player's own fade-in/out control bar. */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={copyLink}
//             className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10"
//           >
//             {copied ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
//             {copied ? "Link copied" : "Invite friends"}
//           </button>
//           <button
//             onClick={leaveRoom}
//             className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10"
//           >
//             <LogOut className="h-4 w-4" />
//             Leave room
//           </button>
//           <div className="flex items-center -space-x-2">
//             {people.slice(0, 4).map((p) => (
//               <span
//                 key={p.id}
//                 title={p.name}
//                 className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050505] text-xs font-semibold text-black"
//                 style={{ backgroundColor: p.color }}
//               >
//                 {p.name?.[0]?.toUpperCase() || "?"}
//               </span>
//             ))}
//             {people.length > 4 && (
//               <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050505] bg-white/10 text-xs font-medium text-neutral-200">
//                 +{people.length - 4}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
//         <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-4">
//           {/* The room-code badge and the floating copy-link/leave-room
//               buttons that used to sit here permanently on top of the video
//               have been removed. They duplicated the header controls above
//               and, because they never hid themselves, they visually
//               competed with the player's own auto-hide control bar (the one
//               with volume/timeline/settings) — which is why that bar could
//               look like it wasn't showing up correctly. Now the video area
//               only has the player's own chrome. */}

//           <div className="relative flex aspect-video w-full max-w-[1600px] max-h-[130vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
//             <ReactionOverlay incoming={incomingReaction} />

//             {movie ? (
//               <div className="flex h-full w-full flex-col items-center justify-center gap-4">
//                 {movie.trailerKey ? (
//                   <TrailerPlayer
//                     trailerKey={movie.trailerKey}
//                     posterUrl={movie.posterUrl}
//                     movieTitle={movie.title}
//                     // "Same movie" search button in the player now opens the
//                     // general movie search modal (MovieSearchModal) directly
//                     // — NOT the genre picker. Genre modal stays reachable
//                     // separately from the idle state's "Find something new".
//                     onChangeMovie={() => {
//                       setShowSuggestions(false);
//                       setShowGenreModal(false);
//                       setShowSearch(true);
//                     }}
//                     onRequestPlayPause={requestPlayPause}
//                     onRequestSeek={requestSeek}
//                     syncedPlaying={syncedPlaying}
//                     syncedTime={syncedTime}
//                     seekVersion={seekVersion}
//                   />
//                 ) : (
//                   <div className="flex flex-col items-center gap-4 p-8 text-center">
//                     {movie.posterUrl && (
//                       <img
//                         src={movie.posterUrl}
//                         alt=""
//                         className="h-40 w-28 rounded-lg object-cover shadow-lg"
//                       />
//                     )}
//                     <div>
//                       {/* <p className="font-display text-xl font-semibold text-white">{movie.title}</p> */}
//                       <p className="mt-1 text-sm text-neutral-500">No trailer available for this title.</p>
//                     </div>
//                     <button
//                       onClick={() => setShowSearch(true)}
//                       className="rounded-full border border-white/15 px-5 py-2 text-sm text-neutral-200 hover:bg-white/10"
//                     >
//                       Search movie
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               // ---- idle state: surprise us / find something new / search a title ----
//               <div className="w-full max-w-sm px-4">
//                 <div className="flex flex-col items-center gap-1 pb-5 text-center">
//                   <Film className="h-6 w-6 text-neutral-600" />
//                   <p className="mt-2 text-base font-medium text-neutral-200">
//                     Nothing's queued up yet
//                   </p>
//                   <p className="text-xs text-neutral-500">
//                     Let the room decide, or go straight to a title.
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
//                   <button
//                     onClick={surpriseUs}
//                     disabled={surprising}
//                     className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-[#04223a] shadow-[0_3px_0_rgba(0,0,0,0.25)] transition active:translate-y-[1px] active:shadow-none disabled:opacity-60"
//                     style={{ background: "linear-gradient(90deg, #5CF2E3 0%, #8B5CF6 100%)" }}
//                   >
//                     <Shuffle className="h-4 w-4" />
//                     {surprising ? "Picking something…" : "Surprise us"}
//                   </button>
//                   <p className="mt-2 text-center text-[11px] text-neutral-500">
//                     One tap — trailer starts right away
//                   </p>

//                   {surpriseError && (
//                     <p className="mt-2 text-center text-xs text-red-400">{surpriseError}</p>
//                   )}

//                   <div className="my-4 flex items-center gap-3">
//                     <div className="h-px flex-1 bg-white/10" />
//                     <span className="text-[10px] uppercase tracking-widest text-neutral-600">or</span>
//                     <div className="h-px flex-1 bg-white/10" />
//                   </div>

//                   <div className="flex gap-2.5">
//                     <button
//                       onClick={() => setShowGenreModal(true)}
//                       className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-3.5 text-xs font-medium text-neutral-200 hover:bg-white/[0.06]"
//                     >
//                       <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5CF2E3]/10">
//                         <Sparkles className="h-4 w-4 text-[#5CF2E3]" />
//                       </span>
//                       Find something new
//                     </button>
//                     <button
//                       onClick={() => setShowSearch(true)}
//                       className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-3.5 text-xs font-medium text-neutral-200 hover:bg-white/[0.06]"
//                     >
//                       <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5CF2E3]/10">
//                         <Search className="h-4 w-4 text-[#5CF2E3]" />
//                       </span>
//                       Search a title
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <ReactionBar onReact={sendReaction} />
//         </main>

//         <aside className="flex min-h-0 w-full flex-col border-t border-white/10 lg:w-[360px] lg:border-l lg:border-t-0">
//           <div className="flex shrink-0 border-b border-white/10">
//             <button
//               onClick={() => setTab("chat")}
//               className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm ${
//                 tab === "chat" ? "text-white" : "text-neutral-500"
//               }`}
//               style={tab === "chat" ? { borderBottom: "2px solid #5CF2E3" } : undefined}
//             >
//               <MessageCircle className="h-4 w-4" />
//               Chat
//             </button>
//             <button
//               onClick={() => setTab("people")}
//               className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm ${
//                 tab === "people" ? "text-white" : "text-neutral-500"
//               }`}
//               style={tab === "people" ? { borderBottom: "2px solid #5CF2E3" } : undefined}
//             >
//               <Users className="h-4 w-4" />
//               People ({people.length})
//             </button>
//           </div>

//           <div className="min-h-0 flex-1 overflow-y-auto">
//             {tab === "chat" ? (
//               <ChatPanel messages={messages} myName={name} onSend={sendChat} />
//             ) : (
//               <ParticipantsList people={people} />
//             )}
//           </div>
//         </aside>
//       </div>

//       {showGenreModal && (
//         <GenreSelectModal
//           onClose={() => setShowGenreModal(false)}
//           onBack={() => setShowGenreModal(false)}
//           onSubmit={submitGenres}
//           initialGenres={myGenres || []}
//         />
//       )}

//       {showSuggestions && myGenres && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
//           <div className="h-[80vh] w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0a0a]">
//             <SuggestionsPanel
//               genres={myGenres}
//               onSelectMovie={selectMovie}
//               onChangeGenres={() => {
//                 setShowSuggestions(false);
//                 setShowGenreModal(true);
//               }}
//               onBack={() => {
//                 setShowSuggestions(false);
//                 setShowGenreModal(true);
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {showSearch && (
//         <MovieSearchModal onClose={() => setShowSearch(false)} onSelect={selectMovie} />
//       )}
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, LogOut, Users, MessageCircle, Film, Sparkles, Search, Shuffle, ArrowLeft, UserPlus } from "lucide-react";
import { getSocket } from "@/lib/socket";
import ParticipantsList from "@/components/watchparty/ParticipantsList";
import ChatPanel from "@/components/watchparty/ChatPanel";
import ReactionBar, { ReactionOverlay } from "@/components/watchparty/ReactionBar";
import MovieSearchModal from "@/components/watchparty/MovieSearchModal";
import TrailerPlayer from "@/components/watchparty/TrailerPlayer";
import GenreSelectModal from "@/components/watchparty/GenreSelectModal";
import SuggestionsPanel from "@/components/watchparty/SuggestionsPanel";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function WatchRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [name, setName] = useState(() => sessionStorage.getItem("wp_name") || "");
  const [nameDraft, setNameDraft] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [people, setPeople] = useState([]);
  const [messages, setMessages] = useState([]);
  const [movie, setMovie] = useState(null);
  const [tab, setTab] = useState("chat"); // "chat" | "people"
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [incomingReaction, setIncomingReaction] = useState(null);

  // Genre / suggestions flow
  const [genrePicks, setGenrePicks] = useState({}); // { socketId: [genres] }
  const [myGenres, setMyGenres] = useState(null); // null = haven't picked yet
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // "Surprise us" is a standalone one-tap action — it doesn't go through
  // the genre modal at all. It uses whatever genres the room has already
  // picked (if any); otherwise the backend falls back to a broad default
  // pool, so this never blocks on a 400.
  const [surprising, setSurprising] = useState(false);
  const [surpriseError, setSurpriseError] = useState("");

  // While selectMovie() is off fetching the trailer key, disable further
  // picks so a fast double-click can't fire two select-movie emits.
  const [selectingMovie, setSelectingMovie] = useState(false);

  // Synced playback state — driven by the room, not local component state
  const [syncedPlaying, setSyncedPlaying] = useState(false);
  const [syncedTime, setSyncedTime] = useState(0);
  const [seekVersion, setSeekVersion] = useState(0);

  // Uses window.location.origin, so on a local dev server this naturally
  // resolves to http://localhost:<port>/watch-room/<roomId>.
  const shareLink = `${window.location.origin}/watch-room/${roomId}`;

  useEffect(() => {
    if (!name) return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();

    const hostToken = sessionStorage.getItem(`wp_host_${roomId}`) || null;

    const onRoomState = (state) => {
      setPeople(state.people || []);
      setMessages(state.messages || []);
      setMovie(state.movie || null);
      setSyncedPlaying(state.playing || false);
      setSyncedTime(state.currentTime || 0);
      setGenrePicks(state.genrePicks || {});
      setJoined(true);
      setJoinError("");
    };
    const onJoinError = (err) => setJoinError(err.message || "Couldn't join this room.");
    const onPeopleUpdate = (list) => setPeople(list);
    const onChatMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onMovieSelected = ({ movie: m }) => {
      setMovie(m);
      setSyncedTime(0);
      setSeekVersion(0);
      setSyncedPlaying(true);
      socketRef.current?.emit("play-pause", { roomCode: roomId, playing: true });
    };
    const onPlayState = ({ playing }) => setSyncedPlaying(playing);
    const onSeekUpdate = ({ currentTime }) => {
      setSyncedTime(currentTime);
      setSeekVersion((v) => v + 1);
    };
    const onReaction = (payload) => setIncomingReaction(payload);
    const onGenrePicksUpdate = ({ picks }) => setGenrePicks(picks || {});

    socket.on("room-state", onRoomState);
    socket.on("join-error", onJoinError);
    socket.on("people-update", onPeopleUpdate);
    socket.on("chat-message", onChatMessage);
    socket.on("movie-selected", onMovieSelected);
    socket.on("play-state", onPlayState);
    socket.on("seek", onSeekUpdate);
    socket.on("reaction", onReaction);
    socket.on("genre-picks-update", onGenrePicksUpdate);

    socket.on("connect", () => {
      socket.emit("join-room", { roomCode: roomId, name, hostToken });
    });

    return () => {
      socket.emit("leave-room");
      socket.off("room-state", onRoomState);
      socket.off("join-error", onJoinError);
      socket.off("people-update", onPeopleUpdate);
      socket.off("chat-message", onChatMessage);
      socket.off("movie-selected", onMovieSelected);
      socket.off("play-state", onPlayState);
      socket.off("seek", onSeekUpdate);
      socket.off("reaction", onReaction);
      socket.off("genre-picks-update", onGenrePicksUpdate);
      socket.disconnect();
    };
  }, [name, roomId]);

  const submitName = (e) => {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    sessionStorage.setItem("wp_name", trimmed);
    setName(trimmed);
  };

  const leaveRoom = () => {
    socketRef.current?.emit("leave-room");
    socketRef.current?.disconnect();
    navigate("/watchparty");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const sendChat = (text) => {
    socketRef.current?.emit("chat-message", { roomCode: roomId, name, text });
  };

  const sendReaction = (emoji) => {
    socketRef.current?.emit("reaction", { roomCode: roomId, emoji });
  };

  // Fetches a YouTube trailer key for the chosen title (unless the result
  // already came with one, e.g. from a future search variant) and only
  // then broadcasts the pick to the room. If no trailer is found, movie
  // still gets selected — trailerKey just stays null and the room UI
  // falls back to its existing "No trailer available for this title" state.
  const selectMovie = async (result) => {
    setSelectingMovie(true);
    let trailerKey = result.trailerKey || null;

    if (!trailerKey && result.id && result.mediaType) {
      try {
        const res = await fetch(
          `${API_BASE}/watchparty/trailer/${result.mediaType}/${result.id}`,
        );
        const data = await res.json();
        if (res.ok) trailerKey = data.trailerKey || null;
      } catch {
        // Network hiccup or no trailer found — trailerKey stays null and
        // the room simply shows the "no trailer" state for this title.
      }
    }

    socketRef.current?.emit("select-movie", {
      roomCode: roomId,
      movie: {
        id: result.id,
        mediaType: result.mediaType,
        title: result.title,
        posterUrl: result.posterUrl,
        trailerKey,
      },
    });
    setShowSearch(false);
    setShowSuggestions(false);
    setSelectingMovie(false);
  };

  const submitGenres = (genres) => {
    setMyGenres(genres);
    socketRef.current?.emit("select-genres", { roomCode: roomId, genres });
    setShowGenreModal(false);
    setShowSuggestions(true);
  };

  // Bypasses the genre modal entirely. Uses whatever genres the room has
  // already agreed on (from genrePicks); if nobody has picked any yet, the
  // query param is just omitted and the backend applies its own default
  // pool, so this always resolves to a pick.
  const surpriseUs = async () => {
    setSurprising(true);
    setSurpriseError("");
    try {
      const roomGenres = Array.from(new Set(Object.values(genrePicks).flat()));
      const url = roomGenres.length
        ? `${API_BASE}/watchparty/surprise?genres=${encodeURIComponent(roomGenres.join(","))}`
        : `${API_BASE}/watchparty/surprise`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't get a surprise pick");
      if (data.pick) await selectMovie(data.pick);
    } catch (err) {
      setSurpriseError(err.message || "Couldn't get a surprise pick. Try again.");
    } finally {
      setSurprising(false);
    }
  };

  const requestPlayPause = (playing) => {
    socketRef.current?.emit("play-pause", { roomCode: roomId, playing });
  };

  const requestSeek = (time) => {
    socketRef.current?.emit("seek", { roomCode: roomId, time });
  };

  if (!name) {
    return (
      <div className="flex h-screen items-center justify-center overflow-hidden bg-[#050505] px-6">
        <form
          onSubmit={submitName}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
        >
          <span className="label-caps text-xs tracking-[0.3em]" style={{ color: "#5CF2E3" }}>
            Joining a room
          </span>
          <h1 className="font-display mt-3 text-2xl font-semibold text-white">
            What should we call you?
          </h1>
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Your name"
            maxLength={24}
            className="mt-6 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-center text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#5CF2E3]/50"
          />
          <button
            type="submit"
            disabled={!nameDraft.trim()}
            className="mt-4 w-full rounded-full py-3 font-semibold text-black disabled:opacity-40"
            style={{ backgroundColor: "#5CF2E3" }}
          >
            Enter room
          </button>
        </form>
      </div>
    );
  }

  if (joinError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#050505] px-6 text-center">
        <p className="text-lg text-white">{joinError}</p>
        <button
          onClick={() => navigate("/watchparty")}
          className="rounded-full px-6 py-3 font-semibold text-black"
          style={{ backgroundColor: "#5CF2E3" }}
        >
          Host a new watch party
        </button>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="flex h-screen items-center justify-center overflow-hidden bg-[#050505] text-neutral-400">
        Joining room…
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050505] text-white">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/watchparty")}
            aria-label="Back"
            className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">{movie?.title || "Watch party"}</h1>
          {movie && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#5CF2E3]/25 bg-[#5CF2E3]/10 px-3 py-1 text-xs font-medium text-[#5CF2E3]">
              <Shuffle className="h-3 w-3" />
              {people.length > 1 ? "Both synced" : "Synced"}
            </span>
          )}
        </div>

        {/* Invite + leave now live together here — this is the single,
            persistent place for both actions. The old floating copies of
            these that used to sit on top of the video were removed so
            there's only one source of truth and no visual clash with the
            player's own fade-in/out control bar. */}
        <div className="flex items-center gap-3">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10"
          >
            {copied ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {copied ? "Link copied" : "Invite friends"}
          </button>
          <button
            onClick={leaveRoom}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Leave room
          </button>
          <div className="flex items-center -space-x-2">
            {people.slice(0, 4).map((p) => (
              <span
                key={p.id}
                title={p.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050505] text-xs font-semibold text-black"
                style={{ backgroundColor: p.color }}
              >
                {p.name?.[0]?.toUpperCase() || "?"}
              </span>
            ))}
            {people.length > 4 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050505] bg-white/10 text-xs font-medium text-neutral-200">
                +{people.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-4">
          {/* The room-code badge and the floating copy-link/leave-room
              buttons that used to sit here permanently on top of the video
              have been removed. They duplicated the header controls above
              and, because they never hid themselves, they visually
              competed with the player's own auto-hide control bar (the one
              with volume/timeline/settings) — which is why that bar could
              look like it wasn't showing up correctly. Now the video area
              only has the player's own chrome. */}

          <div className="relative flex aspect-video w-full max-w-[1600px] max-h-[130vh] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <ReactionOverlay incoming={incomingReaction} />

            {movie ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                {movie.trailerKey ? (
                  <TrailerPlayer
                    trailerKey={movie.trailerKey}
                    posterUrl={movie.posterUrl}
                    movieTitle={movie.title}
                    // "Same movie" search button in the player now opens the
                    // general movie search modal (MovieSearchModal) directly
                    // — NOT the genre picker. Genre modal stays reachable
                    // separately from the idle state's "Find something new".
                    onChangeMovie={() => {
                      setShowSuggestions(false);
                      setShowGenreModal(false);
                      setShowSearch(true);
                    }}
                    onRequestPlayPause={requestPlayPause}
                    onRequestSeek={requestSeek}
                    syncedPlaying={syncedPlaying}
                    syncedTime={syncedTime}
                    seekVersion={seekVersion}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    {movie.posterUrl && (
                      <img
                        src={movie.posterUrl}
                        alt=""
                        className="h-40 w-28 rounded-lg object-cover shadow-lg"
                      />
                    )}
                    <div>
                      <p className="mt-1 text-sm text-neutral-500">No trailer available for this title.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => {
                          setShowSuggestions(false);
                          setShowGenreModal(true);
                        }}
                        className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm text-neutral-200 hover:bg-white/10"
                      >
                        <Sparkles className="h-4 w-4 text-[#5CF2E3]" />
                        Find something new
                      </button>
                      <button
                        onClick={() => setShowSearch(true)}
                        className="rounded-full border border-white/15 px-5 py-2 text-sm text-neutral-200 hover:bg-white/10"
                      >
                        Search movie
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ---- idle state: surprise us / find something new / search a title ----
              <div className="w-full max-w-sm px-4">
                <div className="flex flex-col items-center gap-1 pb-5 text-center">
                  <Film className="h-6 w-6 text-neutral-600" />
                  <p className="mt-2 text-base font-medium text-neutral-200">
                    Nothing's queued up yet
                  </p>
                  <p className="text-xs text-neutral-500">
                    Let the room decide, or go straight to a title.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <button
                    onClick={surpriseUs}
                    disabled={surprising || selectingMovie}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-[#04223a] shadow-[0_3px_0_rgba(0,0,0,0.25)] transition active:translate-y-[1px] active:shadow-none disabled:opacity-60"
                    style={{ background: "linear-gradient(90deg, #5CF2E3 0%, #8B5CF6 100%)" }}
                  >
                    <Shuffle className="h-4 w-4" />
                    {surprising || selectingMovie ? "Picking something…" : "Surprise us"}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-neutral-500">
                    One tap — trailer starts right away
                  </p>

                  {surpriseError && (
                    <p className="mt-2 text-center text-xs text-red-400">{surpriseError}</p>
                  )}

                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] uppercase tracking-widest text-neutral-600">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setShowGenreModal(true)}
                      className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-3.5 text-xs font-medium text-neutral-200 hover:bg-white/[0.06]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5CF2E3]/10">
                        <Sparkles className="h-4 w-4 text-[#5CF2E3]" />
                      </span>
                      Find something new
                    </button>
                    <button
                      onClick={() => setShowSearch(true)}
                      className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-3.5 text-xs font-medium text-neutral-200 hover:bg-white/[0.06]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5CF2E3]/10">
                        <Search className="h-4 w-4 text-[#5CF2E3]" />
                      </span>
                      Search a title
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ReactionBar onReact={sendReaction} />
        </main>

        <aside className="flex min-h-0 w-full flex-col border-t border-white/10 lg:w-[360px] lg:border-l lg:border-t-0">
          <div className="flex shrink-0 border-b border-white/10">
            <button
              onClick={() => setTab("chat")}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm ${
                tab === "chat" ? "text-white" : "text-neutral-500"
              }`}
              style={tab === "chat" ? { borderBottom: "2px solid #5CF2E3" } : undefined}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
            <button
              onClick={() => setTab("people")}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm ${
                tab === "people" ? "text-white" : "text-neutral-500"
              }`}
              style={tab === "people" ? { borderBottom: "2px solid #5CF2E3" } : undefined}
            >
              <Users className="h-4 w-4" />
              People ({people.length})
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "chat" ? (
              <ChatPanel messages={messages} myName={name} onSend={sendChat} />
            ) : (
              <ParticipantsList people={people} />
            )}
          </div>
        </aside>
      </div>

      {showGenreModal && (
        <GenreSelectModal
          onClose={() => setShowGenreModal(false)}
          onBack={() => setShowGenreModal(false)}
          onSubmit={submitGenres}
          initialGenres={myGenres || []}
        />
      )}

      {showSuggestions && myGenres && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="h-[80vh] w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0a0a0a]">
            <SuggestionsPanel
              genres={myGenres}
              onSelectMovie={selectMovie}
              onChangeGenres={() => {
                setShowSuggestions(false);
                setShowGenreModal(true);
              }}
              onBack={() => {
                setShowSuggestions(false);
                setShowGenreModal(true);
              }}
            />
          </div>
        </div>
      )}

      {showSearch && (
        <MovieSearchModal onClose={() => setShowSearch(false)} onSelect={selectMovie} />
      )}
    </div>
  );
}