// import React, { useState, useRef, useEffect, useCallback } from "react";
// import AnimatedOrb from "./AnimatedOrb";

// /* ============================================================
//    Media Assistant Chatbot - wired to real backend
//    Endpoints used (all relative to chatUrl, default "/api/chat"):
//      POST {chatUrl}/search   { sessionId, query, mode }   mode: "song" | "media"
//      POST {chatUrl}/select   { sessionId, tmdbId, mediaType }
//      POST {chatUrl}/message  { sessionId, message, buttonIntent }

//    NOTE: activeCard tracks whether a title is currently selected.
//    - If activeCard is null -> free text goes to /search (new lookup)
//    - If activeCard is set  -> free text goes to /message (follow-up
//      question about the currently selected title, uses session.context
//      on the backend)

//    NOTE: searchMode tracks which bucket the user picked at the start
//    of the conversation (Song, or Movie/TV/Anime). This is required
//    before any /search call is made, so the backend knows whether to
//    hit Deezer only or TMDB only.
// ============================================================= */

// const COLORS = {
//   reelBlack: "#111014",
//   reelPanel: "#19181d",
//   reelCard: "#221f26",
//   reelInputDark: "#0d0c10",
//   marqueeGold: "#2FE0D0",
//   marqueeGoldDim: "#1a8a80",
//   marqueeGoldBright: "#5CF2E3",
//   shieldTeal: "#2FA592",
//   warnRed: "#C25B4A",
//   ink: "#F2EFE9",
//   inkDim: "#9C978E",
//   inkFaint: "#605C56",
//   border: "#2c2a31",
//   inputBorder: "#33303a",
// };

// function SendIcon() {
//   return (
//     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111014" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//       <line x1="22" y1="2" x2="11" y2="13"></line>
//       <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
//     </svg>
//   );
// }

// function SyncIcon() {
//   return (
//     <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-5M20 15a8 8 0 01-14 5" />
//     </svg>
//   );
// }

// function TypingDots() {
//   return (
//     <div style={{ display: "flex", gap: 4, padding: "4px 2px" }}>
//       {[0, 1, 2].map((i) => (
//         <span
//           key={i}
//           style={{
//             width: 6,
//             height: 6,
//             borderRadius: "50%",
//             background: COLORS.inkFaint,
//             animation: "esb-bounce 1.1s infinite ease-in-out",
//             animationDelay: `${i * 0.15}s`,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PlusIcon() {
//   return (
//     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//       <line x1="12" y1="5" x2="12" y2="19"></line>
//       <line x1="5" y1="12" x2="19" y2="12"></line>
//     </svg>
//   );
// }

// function StarIcon({ color = COLORS.marqueeGold }) {
//   return (
//     <svg viewBox="0 0 24 24" width="14" height="14" fill={color} stroke={color} strokeWidth="1">
//       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//     </svg>
//   );
// }

// // Generates a stable per-tab session id (persists for this browser tab only,
// // which matches the "RAM, no DB" session design on the backend).
// function makeSessionId() {
//   if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
//   return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
// }

// const MOVIE_INTENT_META = {
//   story: { label: "Storyline", emoji: "📖", buttonIntent: "storyline" },
//   cast: { label: "Cast", emoji: "🎭", buttonIntent: "cast" },
//   ratings: { label: "Ratings", emoji: "⭐", buttonIntent: "rating" },
//   similar: { label: "Similar Titles", emoji: "🔁", buttonIntent: "similar" },
// };

// const SONG_INTENT_META = {
//   about: { label: "About This Song", emoji: "🎧", buttonIntent: "about" },
//   similar: { label: "More From This Artist", emoji: "🔁", buttonIntent: "similar" },
// };

// function getIntentMeta(mediaType, key) {
//   return mediaType === "song" ? SONG_INTENT_META[key] : MOVIE_INTENT_META[key];
// }

// // Turns the raw backend payload for each intent into display text.
// function formatIntentResult(intentKey, payload) {
//   const { intent, source, data } = payload;

//   if (intent === "cast") {
//     const castNames = (data.cast || []).slice(0, 6).map((c) => `${c.name} as ${c.character}`);
//     const director = (data.crew || []).find((c) => c.job === "Director");
//     let text = castNames.length ? castNames.join(", ") + "." : "No cast info found.";
//     if (director) text += ` Directed by ${director.name}.`;
//     return { text, source: "Source: TMDB" };
//   }

//   if (intent === "rating") {
//     const r = data;
//     return {
//       text: `TMDB score: ${r.tmdb_score ?? "N/A"}/5 from ${r.vote_count ?? 0} votes.`,
//       source: "Source: TMDB",
//     };
//   }

//   if (intent === "similar" && source === "deezer") {
//     const list = (data || []).map((t) => `${t.title}`);
//     return {
//       text: list.length ? `More from this artist: ${list.join(", ")}.` : "No other tracks found.",
//       source: "Source: Deezer",
//     };
//   }

//   if (intent === "similar") {
//     const list = (data || []).map((s) => `${s.title}${s.release_year ? ` (${s.release_year})` : ""}`);
//     return {
//       text: list.length ? `You might also like: ${list.join(", ")}.` : "No similar titles found.",
//       source: "Source: TMDB",
//     };
//   }

//   if (intent === "reviews") {
//     const list = (data || []).map((r) => `${r.author}: ${r.content}`);
//     return { text: list.length ? list[0] : "No reviews found.", source: "Source: TMDB" };
//   }

//   // storyline / open_question -> Gemini
//   return {
//     text: data.text,
//     source: data.sources?.length ? `Source: ${data.sources[0]}` : "Source: Gemini AI",
//   };
// }

// export default function MediaAssistantChatbot({
//   siteName = "WatchVerse AI",
//   chatUrl = "/api/chat",
//   libraryUrl = "",
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [library, setLibrary] = useState({
//     watchlist: [],
//     watchedHistory: [],
//     likedSongs: [],
//     playlists: [],
//   });
//   const [libraryLoaded, setLibraryLoaded] = useState(false);
//   const [syncState, setSyncState] = useState("idle");
//   const [syncText, setSyncText] = useState("Syncing your library...");

//   // Tracks the currently selected title/song, so free-text input
//   // knows whether to search for something new or ask a follow-up question
//   // about what's already selected.
//   const [activeCard, setActiveCard] = useState(null);

//   // NEW: tracks which bucket the user picked at the start of the
//   // conversation - "song" or "media" (movie/tv/anime). Required before
//   // any fresh /search call, so the backend knows which API to hit.
//   const [searchMode, setSearchMode] = useState(null);

//   const messagesEndRef = useRef(null);
//   const textareaRef = useRef(null);
//   const sessionIdRef = useRef(makeSessionId());

//   const scrollDown = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
//   }, []);

//   useEffect(() => {
//     scrollDown();
//   }, [messages, isTyping, scrollDown]);

//   const syncLibrary = useCallback(async () => {
//     if (!libraryUrl) {
//       setSyncState("off");
//       setSyncText("Library sync disabled.");
//       setLibraryLoaded(true);
//       return;
//     }
//     setSyncState("syncing");
//     setSyncText("Syncing your library...");
//     try {
//       const res = await fetch(libraryUrl, { credentials: "include" });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Backend Error");

//       const nextLibrary = {
//         watchlist: data.watchlist || [],
//         watchedHistory: data.watchedHistory || [],
//         likedSongs: data.likedSongs || [],
//         playlists: data.playlists || [],
//       };
//       setLibrary(nextLibrary);
//       setLibraryLoaded(true);
//       const total = nextLibrary.watchlist.length + nextLibrary.watchedHistory.length;
//       setSyncState("ok");
//       setSyncText(`Library synced - ${total} items loaded`);
//     } catch (err) {
//       console.error(err);
//       setSyncState("error");
//       setSyncText("Couldn't sync library.");
//       setLibraryLoaded(true);
//     }
//   }, [libraryUrl]);

//   const handleToggleOpen = () => {
//     const willOpen = !isOpen;
//     setIsOpen(willOpen);
//     if (willOpen && !libraryLoaded) syncLibrary();
//     if (willOpen && messages.length === 0) {
//       setMessages([
//         {
//           role: "bot",
//           text: `Hey! I'm your ${siteName} co-pilot. What are you looking for?`,
//           modeOptions: true,
//         },
//       ]);
//     }
//   };

//   // NEW: handles the initial Song vs Movie/TV/Anime button choice.
//   const selectMode = (mode) => {
//      console.log("🟢 MODE SELECTED:", mode);
//     const label = mode === "song" ? "🎵 Song" : "🎬 Movie / TV / Anime";
//     setMessages((prev) => [...prev, { role: "user", text: label }]);
//     setSearchMode(mode);
//     setMessages((prev) => [
//       ...prev,
//       {
//         role: "bot",
//         text:
//           mode === "song"
//             ? "Great — what song are you looking for?"
//             : "Great — what movie, show, or anime are you looking for?",
//       },
//     ]);
//   };

//   // Real call to POST {chatUrl}/message for a given intent, attached to a card.
//   const runIntent = async (intentKey, cardOrOption) => {
//     const meta = getIntentMeta(cardOrOption?.mediaType, intentKey);
//     setMessages((prev) => [...prev, { role: "user", text: `${meta.emoji} ${meta.label}` }]);
//     setIsTyping(true);

//     try {
//       const res = await fetch(`${chatUrl}/message`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sessionId: sessionIdRef.current,
//           message: meta.label,
//           buttonIntent: meta.buttonIntent,
//         }),
//       });
//       const payload = await res.json();
//       if (!res.ok) throw new Error(payload.error || "Backend error");

//       const { text, source } = formatIntentResult(intentKey, payload);

//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "bot",
//           categoryResult: {
//             title: meta.label,
//             emoji: meta.emoji,
//             body: text,
//             source,
//             parentCard: cardOrOption,
//           },
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       setMessages((prev) => [
//         ...prev,
//         { role: "bot", text: "Sorry, I couldn't fetch that just now. Try again in a moment." },
//       ]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   // Real call to POST {chatUrl}/select when user disambiguates between multiple matches.
//   const selectOption = async (option) => {
//     const label = option.mediaType === "song" ? `${option.title} — ${option.artist}` : `${option.title} (${option.year})`;
//     setMessages((prev) => [...prev, { role: "user", text: label }]);
//     setIsTyping(true);

//     try {
//       const res = await fetch(`${chatUrl}/select`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ sessionId: sessionIdRef.current, ...option }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Backend error");

//       setActiveCard(data.card); // mark this title as the active context
//       setMessages((prev) => [
//         ...prev,
//         { role: "bot", text: "Got it, here's what I found:", card: data.card },
//       ]);
//     } catch (err) {
//       console.error(err);
//       setMessages((prev) => [
//         ...prev,
//         { role: "bot", text: "Sorry, couldn't load that title. Try again?" },
//       ]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   // Free-text input handler.
//   // - If no title is active yet -> POST {chatUrl}/search (new lookup, requires searchMode)
//   // - If a title IS active      -> POST {chatUrl}/message (follow-up question,
//   //   uses the backend's session.context so Gemini stays anchored to the
//   //   currently selected movie/show/anime/song instead of re-searching)
//   const sendMessage = async () => {
//     const text = inputValue.trim();
//     if (!text || isSending) return;
//     console.log("🟡 SEND MESSAGE - activeCard:", activeCard, "searchMode:", searchMode); // TEMP DEBUG
//     setInputValue("");
//     if (textareaRef.current) textareaRef.current.style.height = "auto";
//     setIsSending(true);
//     setMessages((prev) => [...prev, { role: "user", text }]);
//     setIsTyping(true);

//     try {
//       if (activeCard) {
//         // Follow-up question about the currently selected title
//         const res = await fetch(`${chatUrl}/message`, {
//           method: "POST",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             sessionId: sessionIdRef.current,
//             message: text,
//           }),
//         });
//         const payload = await res.json();
//         if (!res.ok) throw new Error(payload.error || "Backend error");

//         const { text: bodyText, source } = formatIntentResult(payload.intent, payload);

//         setMessages((prev) => [
//           ...prev,
//           {
//             role: "bot",
//             categoryResult: {
//               title: "Follow-up",
//               emoji: "💬",
//               body: bodyText,
//               source,
//               parentCard: activeCard,
//             },
//           },
//         ]);
//       } else if (!searchMode) {
//         // No mode picked yet - re-prompt instead of guessing what they want
//         setMessages((prev) => [
//           ...prev,
//           { role: "bot", text: "Just tap one of these first 👇", modeOptions: true },
//         ]);
//       } else {
//         // No active title yet - treat this as a fresh search, scoped by searchMode
//         const res = await fetch(`${chatUrl}/search`, {
//           method: "POST",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ sessionId: sessionIdRef.current, query: text, mode: searchMode }),
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Backend error");

//         if (data.status === "not_found") {
//           setMessages((prev) => [...prev, { role: "bot", text: data.message }]);
//         } else if (data.status === "ambiguous") {
//           setMessages((prev) => [
//             ...prev,
//             {
//               role: "bot",
//               text: "I found a few matches — which one did you mean?",
//               options: data.options,
//             },
//           ]);
//         } else if (data.status === "resolved") {
//           setActiveCard(data.card); // mark this title as the active context
//           setMessages((prev) => [
//             ...prev,
//             { role: "bot", text: "Sure! Here's what I found:", card: data.card },
//           ]);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//       setMessages((prev) => [
//         ...prev,
//         { role: "bot", text: "Sorry, I couldn't reach the assistant just now. Please try again." },
//       ]);
//     } finally {
//       setIsTyping(false);
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const handleInput = (e) => {
//     setInputValue(e.target.value);
//     const el = e.target;
//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 80) + "px";
//   };

//   return (
//     <div style={{ fontFamily: "'Inter', sans-serif" }}>
//       <style>{`
//         @keyframes esb-bounce {
//           0%, 60%, 100% { transform: translateY(0); opacity: .5; }
//           30% { transform: translateY(-4px); opacity: 1; }
//         }
//         .esb-scroll::-webkit-scrollbar { width: 6px; }
//         .esb-scroll::-webkit-scrollbar-thumb { background: #3a3740; border-radius: 3px; }
//         .esb-textarea::placeholder { color: ${COLORS.inkFaint}; }
//         .action-button {
//           background: ${COLORS.reelCard};
//           border: 1px solid ${COLORS.border};
//           color: ${COLORS.ink};
//           padding: 8px 14px;
//           border-radius: 10px;
//           font-size: 13px;
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           transition: all 0.2s ease;
//         }
//         .action-button:hover {
//           border-color: ${COLORS.marqueeGold};
//           color: ${COLORS.marqueeGoldBright};
//           background: ${COLORS.reelInputDark};
//         }
//         .option-card {
//           background: ${COLORS.reelPanel};
//           border: 1px solid ${COLORS.border};
//           border-radius: 12px;
//           padding: 10px;
//           display: flex;
//           gap: 10px;
//           cursor: pointer;
//           transition: border-color 0.2s ease;
//         }
//         .option-card:hover { border-color: ${COLORS.marqueeGold}; }
//       `}</style>

//       <button
//         onClick={handleToggleOpen}
//         aria-label="Open media assistant"
//         style={{
//           position: "fixed",
//           bottom: 24,
//           right: 24,
//           zIndex: 999998,
//           width: 60,
//           height: 60,
//           borderRadius: "50%",
//           background: "none",
//           border: "none",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           cursor: "pointer",
//           boxShadow: "0 6px 20px rgba(0,0,0,.45)",
//           transition: "transform .18s ease",
//           padding: 0,
//         }}
//         onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
//         onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//       >
//         <AnimatedOrb size={60} />
//       </button>

//       {isOpen && (
//         <div
//           style={{
//             position: "fixed",
//             bottom: 96,
//             right: 24,
//             zIndex: 999999,
//             width: 440,
//             maxWidth: "calc(100vw - 32px)",
//             height: 720,
//             maxHeight: "calc(100vh - 140px)",
//             background: COLORS.reelPanel,
//             borderRadius: 20,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             boxShadow: "0 24px 64px rgba(0,0,0,.6)",
//             border: `1px solid ${COLORS.border}`,
//           }}
//         >
//           <div
//             style={{
//               background: COLORS.reelBlack,
//               padding: "18px 20px",
//               borderBottom: `1px solid ${COLORS.border}`,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               flexShrink: 0,
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//               <div style={{
//                 background: COLORS.marqueeGold,
//                 borderRadius: "50%",
//                 width: 38,
//                 height: 38,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: "bold",
//                 color: COLORS.reelBlack
//               }}>
//                 🤖
//               </div>
//               <div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//                   <h3 style={{ margin: 0, fontSize: 16, color: "#fff", fontWeight: "600" }}>{siteName}</h3>
//                   <span style={{
//                     fontSize: 10,
//                     background: "rgba(47, 224, 208, 0.15)",
//                     color: COLORS.marqueeGold,
//                     padding: "2px 6px",
//                     borderRadius: 6,
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                     letterSpacing: 0.5
//                   }}>Beta</span>
//                 </div>
//                 <p style={{ margin: "2px 0 0 0", fontSize: 11.5, color: COLORS.inkDim }}>Your smart entertainment companion/p>
//               </div>
//             </div>

//             <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//               <button
//                 onClick={() => {
//                   setMessages([
//                     {
//                       role: "bot",
//                       text: `Hey! I'm your ${siteName} co-pilot. What are you looking for?`,
//                       modeOptions: true,
//                     },
//                   ]);
//                   setActiveCard(null);
//                   setSearchMode(null); // reset mode on conversation reset
//                   sessionIdRef.current = makeSessionId();
//                 }}
//                 title="Reset Conversation"
//                 style={{ background: "none", border: "none", color: COLORS.inkDim, cursor: "pointer" }}
//               >
//                 <SyncIcon />
//               </button>
//               <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: COLORS.inkDim, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>&times;</button>
//             </div>
//           </div>

//           <div
//             className="esb-scroll"
//             style={{
//               flex: 1,
//               overflowY: "auto",
//               padding: "20px",
//               display: "flex",
//               flexDirection: "column",
//               gap: 16,
//               background: COLORS.reelBlack,
//             }}
//           >
//             {messages.map((m, idx) => (
//               <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

//                 {m.text && (
//                   <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
//                     {m.role === "bot" && (
//                       <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.reelCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: `1px solid ${COLORS.border}` }}>🤖</div>
//                     )}
//                     <div
//                       style={{
//                         maxWidth: "80%",
//                         padding: "12px 16px",
//                         borderRadius: 16,
//                         fontSize: 13.5,
//                         lineHeight: 1.5,
//                         whiteSpace: "pre-wrap",
//                         ...(m.role === "user"
//                           ? {
//                               background: COLORS.marqueeGold,
//                               color: COLORS.reelBlack,
//                               borderBottomRightRadius: 4,
//                               fontWeight: "500"
//                             }
//                           : {
//                               background: COLORS.reelCard,
//                               color: COLORS.ink,
//                               borderBottomLeftRadius: 4,
//                               border: `1px solid ${COLORS.border}`,
//                             }),
//                       }}
//                     >
//                       {m.text}
//                     </div>
//                   </div>
//                 )}

//                 {/* NEW: Initial mode choice - Song vs Movie/TV/Anime */}
//                 {m.modeOptions && (
//                   <div style={{ paddingLeft: 36, display: "flex", gap: 8, flexWrap: "wrap" }}>
//                     <button className="action-button" onClick={() => selectMode("media")}>
//                       🎬 Movie / TV / Anime
//                     </button>
//                     <button className="action-button" onClick={() => selectMode("song")}>
//                       🎵 Song
//                     </button>
//                   </div>
//                 )}

//                 {/* Disambiguation options (multiple matches within the chosen mode) */}
//                 {m.options && (
//                   <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 8 }}>
//                     {m.options.map((opt) => (
//                       <div key={`${opt.mediaType}-${opt.tmdbId || opt.deezerId}`} className="option-card" onClick={() => selectOption(opt)}>
//                         {opt.poster && (
//                           <img src={opt.poster} alt={opt.title} style={{ width: 46, height: 68, borderRadius: 6, objectFit: "cover" }} />
//                         )}
//                         <div style={{ flex: 1 }}>
//                           <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 600 }}>
//                             {opt.title} {opt.mediaType === "song" ? `— ${opt.artist}` : opt.year ? `(${opt.year})` : ""}
//                             {opt.mediaType === "anime" ? " · Anime" : ""}
//                           </div>
//                           <div style={{ fontSize: 11.5, color: COLORS.inkDim, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
//                             {opt.overview}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {m.card && m.card.mediaType === "song" && (
//                   <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 12 }}>
//                     <div style={{
//                       background: COLORS.reelPanel,
//                       border: `1px solid ${COLORS.border}`,
//                       borderRadius: 16,
//                       padding: "16px",
//                       display: "flex",
//                       gap: 16,
//                     }}>
//                       {m.card.cover && (
//                         <img
//                           src={m.card.cover}
//                           alt={m.card.title}
//                           style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover", border: `1px solid ${COLORS.border}` }}
//                         />
//                       )}
//                       <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
//                         <div>
//                           <h4 style={{ margin: 0, fontSize: 18, color: "#fff", fontWeight: "700" }}>{m.card.title}</h4>
//                           <p style={{ margin: "4px 0 2px 0", fontSize: 13, color: COLORS.marqueeGoldBright }}>{m.card.artist}</p>
//                           <p style={{ margin: 0, fontSize: 12, color: COLORS.inkDim }}>
//                             {m.card.album}{m.card.year ? `  •  ${m.card.year}` : ""}
//                           </p>
//                         </div>
//                         {m.card.previewUrl && (
//                           <audio controls src={m.card.previewUrl} style={{ marginTop: 8, height: 32, width: "100%" }} />
//                         )}
//                         {m.card.deezerUrl && (
//                           <a
//                             href={m.card.deezerUrl}
//                             target="_blank"
//                             rel="noreferrer"
//                             style={{ fontSize: 12, color: COLORS.marqueeGold, marginTop: 8, textDecoration: "none" }}
//                           >
//                             ▶ Open in Spotify
//                           </a>
//                         )}
//                       </div>
//                     </div>

//                     <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                       <button className="action-button" onClick={() => runIntent("about", m.card)}>🎧 About This Song</button>
//                       <button className="action-button" onClick={() => runIntent("similar", m.card)}>🔁 More From This Artist</button>
//                     </div>
//                   </div>
//                 )}

//                 {m.card && m.card.mediaType !== "song" && (
//                   <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 12 }}>
//                     <div style={{
//                       background: COLORS.reelPanel,
//                       border: `1px solid ${COLORS.border}`,
//                       borderRadius: 16,
//                       padding: "16px",
//                       display: "flex",
//                       gap: 16,
//                       position: "relative"
//                     }}>
//                       {m.card.poster && (
//                         <img
//                           src={m.card.poster}
//                           alt={m.card.title}
//                           style={{ width: 105, height: 155, borderRadius: 8, objectFit: "cover", border: `1px solid ${COLORS.border}` }}
//                         />
//                       )}
//                       <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
//                         <div>
//                           <h4 style={{ margin: 0, fontSize: 20, color: "#fff", fontWeight: "700" }}>{m.card.title}</h4>
//                           <p style={{ margin: "4px 0 8px 0", fontSize: 12, color: COLORS.inkDim }}>
//                             {m.card.mediaType === "anime" ? "Anime" : ""}
//                             {m.card.year ? `  •  ${m.card.year}` : ""}
//                             {m.card.genres ? `  •  ${m.card.genres}` : ""}
//                             {m.card.duration ? `  •  ${m.card.duration}` : ""}
//                           </p>
//                           <p style={{ margin: 0, fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5, opacity: 0.9 }}>
//                             {m.card.overview}
//                           </p>
//                         </div>

//                         {m.card.rating != null && (
//                           <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
//                             <div style={{ fontSize: 11, color: COLORS.inkDim }}>
//                               <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#fff", fontWeight: "600", fontSize: 12 }}>
//                                 <StarIcon /> {m.card.rating}/5
//                               </div>
//                               TMDB
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                       <button className="action-button" onClick={() => runIntent("story", m.card)}>📖 Storyline</button>
//                       <button className="action-button" onClick={() => runIntent("cast", m.card)}>🎭 Cast</button>
//                       <button className="action-button" onClick={() => runIntent("ratings", m.card)}>⭐ Ratings</button>
//                       <button className="action-button" onClick={() => runIntent("similar", m.card)}>🔁 Similar Titles</button>
//                     </div>
//                   </div>
//                 )}

//                 {m.categoryResult && (
//                   <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 12 }}>
//                     <div style={{
//                       background: COLORS.reelCard,
//                       border: `1px solid ${COLORS.border}`,
//                       borderRadius: 16,
//                       padding: 16,
//                       position: "relative"
//                     }}>
//                       <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//                         <span style={{ fontSize: 18 }}>{m.categoryResult.emoji}</span>
//                         <h4 style={{ margin: 0, fontSize: 15, color: "#fff", fontWeight: "600" }}>{m.categoryResult.title}</h4>
//                       </div>
//                       <p style={{ margin: 0, fontSize: 13, color: COLORS.ink, lineHeight: 1.6 }}>
//                         {m.categoryResult.body}
//                       </p>
//                       <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                         <span style={{ fontSize: 11, color: COLORS.inkFaint, fontStyle: "italic" }}>
//                           {m.categoryResult.source}
//                         </span>
//                       </div>
//                     </div>

//                     <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
//                       {m.categoryResult.parentCard?.mediaType === "song" ? (
//                         <>
//                           <button className="action-button" onClick={() => runIntent("about", m.categoryResult.parentCard)}>🎧 About This Song</button>
//                           <button className="action-button" onClick={() => runIntent("similar", m.categoryResult.parentCard)}>🔁 More From This Artist</button>
//                         </>
//                       ) : (
//                         <>
//                           <button className="action-button" onClick={() => runIntent("cast", m.categoryResult.parentCard)}>🎭 Cast</button>
//                           <button className="action-button" onClick={() => runIntent("ratings", m.categoryResult.parentCard)}>⭐ Ratings</button>
//                           <button className="action-button" onClick={() => runIntent("similar", m.categoryResult.parentCard)}>🔁 Similar Titles</button>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 )}

//               </div>
//             ))}

//             {isTyping && (
//               <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 36 }}>
//                 <div style={{ padding: "10px 14px", borderRadius: 14, background: COLORS.reelCard, border: `1px solid ${COLORS.border}` }}>
//                   <TypingDots />
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           <div
//             style={{
//               padding: "16px 20px",
//               background: COLORS.reelPanel,
//               borderTop: `1px solid ${COLORS.border}`,
//               flexShrink: 0,
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <button style={{
//                 width: 38,
//                 height: 38,
//                 borderRadius: "50%",
//                 background: "rgba(255,255,255,0.05)",
//                 border: "none",
//                 color: COLORS.inkDim,
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center"
//               }}>
//                 <PlusIcon />
//               </button>

//               <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
//                 <textarea
//                   ref={textareaRef}
//                   className="esb-textarea"
//                   rows={1}
//                   placeholder="Type a message..."
//                   value={inputValue}
//                   onChange={handleInput}
//                   onKeyDown={handleKeyDown}
//                   style={{
//                     width: "100%",
//                     background: COLORS.reelInputDark,
//                     border: `1px solid ${COLORS.inputBorder}`,
//                     borderRadius: 24,
//                     padding: "10px 16px",
//                     fontSize: 13.5,
//                     color: COLORS.ink,
//                     outline: "none",
//                     resize: "none",
//                     maxHeight: 80,
//                     fontFamily: "inherit",
//                   }}
//                 />
//               </div>

//               <button
//                 onClick={sendMessage}
//                 disabled={isSending}
//                 style={{
//                   width: 38,
//                   height: 38,
//                   borderRadius: "50%",
//                   flexShrink: 0,
//                   background: isSending ? COLORS.marqueeGoldDim : COLORS.marqueeGold,
//                   border: "none",
//                   cursor: isSending ? "default" : "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <SendIcon />
//               </button>
//             </div>

//             <p style={{ margin: "10px 0 0 0", fontSize: 10.5, color: COLORS.inkFaint, textAlign: "center" }}>
//               AI can make mistakes. Check important info.
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useRef, useEffect, useCallback } from "react";
import AnimatedOrb from "./AnimatedOrb";

/* ============================================================
   Media Assistant Chatbot - wired to real backend
   Endpoints used (all relative to chatUrl, default "/api/chat"):
     POST {chatUrl}/search   { sessionId, query, mode }   mode: "song" | "media"
     POST {chatUrl}/select   { sessionId, tmdbId, mediaType }
     POST {chatUrl}/message  { sessionId, message, buttonIntent }

   NOTE: activeCard tracks whether a title is currently selected.
   - If activeCard is null -> free text goes to /search (new lookup)
   - If activeCard is set  -> free text goes to /message (follow-up
     question about the currently selected title, uses session.context
     on the backend)

   NOTE: searchMode tracks which bucket the user picked at the start
   of the conversation (Song, or Movie/TV/Anime). Required before any
   /search call is made, so the backend knows whether to hit Spotify
   only or TMDB only.

   NOTE: usedIntents tracks which action buttons (Storyline, Cast,
   Ratings, Similar, About This Song, More From This Artist) have
   already been clicked for a given card, so that button disappears
   from that card's row once used (per card, not globally).
============================================================= */

const COLORS = {
  reelBlack: "#111014",
  reelPanel: "#19181d",
  reelCard: "#221f26",
  reelInputDark: "#0d0c10",
  marqueeGold: "#2FE0D0",
  marqueeGoldDim: "#1a8a80",
  marqueeGoldBright: "#5CF2E3",
  shieldTeal: "#2FA592",
  warnRed: "#C25B4A",
  ink: "#F2EFE9",
  inkDim: "#9C978E",
  inkFaint: "#605C56",
  border: "#2c2a31",
  inputBorder: "#33303a",
};

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111014" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-5M20 15a8 8 0 01-14 5" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: COLORS.inkFaint,
            animation: "esb-bounce 1.1s infinite ease-in-out",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function StarIcon({ color = COLORS.marqueeGold }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill={color} stroke={color} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Generates a stable per-tab session id (persists for this browser tab only,
// which matches the "RAM, no DB" session design on the backend).
function makeSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const MOVIE_INTENT_META = {
  story: { label: "Storyline", emoji: "📖", buttonIntent: "storyline" },
  cast: { label: "Cast", emoji: "🎭", buttonIntent: "cast" },
  ratings: { label: "Ratings", emoji: "⭐", buttonIntent: "rating" },
  similar: { label: "Similar Titles", emoji: "🔁", buttonIntent: "similar" },
};

const SONG_INTENT_META = {
  about: { label: "About This Song", emoji: "🎧", buttonIntent: "about" },
  similar: { label: "More From This Artist", emoji: "🔁", buttonIntent: "similar" },
};

function getIntentMeta(mediaType, key) {
  return mediaType === "song" ? SONG_INTENT_META[key] : MOVIE_INTENT_META[key];
}

// Stable identity for a card, used as the key for tracking which intents
// have already been used on it (works for both song and movie/tv/anime cards).
function getCardKey(card) {
  if (!card) return "unknown";
  return card.mediaType === "song" ? `song-${card.deezerId}` : `media-${card.tmdbId}`;
}

// Turns the raw backend payload for each intent into display text.
function formatIntentResult(intentKey, payload) {
  const { intent, source, data } = payload;

  if (intent === "cast") {
    const castNames = (data.cast || []).slice(0, 6).map((c) => `${c.name} as ${c.character}`);
    const director = (data.crew || []).find((c) => c.job === "Director");
    let text = castNames.length ? castNames.join(", ") + "." : "No cast info found.";
    if (director) text += ` Directed by ${director.name}.`;
    return { text, source: "Source: TMDB" };
  }

  if (intent === "rating") {
    const r = data;
    return {
      text: `TMDB score: ${r.tmdb_score ?? "N/A"}/5 from ${r.vote_count ?? 0} votes.`,
      source: "Source: TMDB",
    };
  }

  if (intent === "similar" && source === "spotify") {
    const list = (data || []).map((t) => `${t.title}`);
    return {
      text: list.length ? `More from this artist: ${list.join(", ")}.` : "No other tracks found.",
      source: "Source: Spotify",
    };
  }

  if (intent === "similar") {
    const list = (data || []).map((s) => `${s.title}${s.release_year ? ` (${s.release_year})` : ""}`);
    return {
      text: list.length ? `You might also like: ${list.join(", ")}.` : "No similar titles found.",
      source: "Source: TMDB",
    };
  }

  if (intent === "reviews") {
    const list = (data || []).map((r) => `${r.author}: ${r.content}`);
    return { text: list.length ? list[0] : "No reviews found.", source: "Source: TMDB" };
  }

  // storyline / open_question -> Gemini
  return {
    text: data.text,
    source: data.sources?.length ? `Source: ${data.sources[0]}` : "Source: Gemini AI",
  };
}

export default function MediaAssistantChatbot({
  siteName = "WatchVerse AI",
  chatUrl = "/api/chat",
  libraryUrl = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [library, setLibrary] = useState({
    watchlist: [],
    watchedHistory: [],
    likedSongs: [],
    playlists: [],
  });
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [syncState, setSyncState] = useState("idle");
  const [syncText, setSyncText] = useState("Syncing your library...");

  // Tracks the currently selected title/song, so free-text input
  // knows whether to search for something new or ask a follow-up question
  // about what's already selected.
  const [activeCard, setActiveCard] = useState(null);

  // Tracks which bucket the user picked at the start of the conversation -
  // "song" or "media" (movie/tv/anime). Required before any fresh /search call.
  const [searchMode, setSearchMode] = useState(null);

  // NEW: tracks which intent buttons have already been used per card, e.g.
  // "media-12345-story" once clicked, so that button can be hidden going forward.
  const [usedIntents, setUsedIntents] = useState(new Set());

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sessionIdRef = useRef(makeSessionId());

  const scrollDown = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollDown();
  }, [messages, isTyping, scrollDown]);

  const syncLibrary = useCallback(async () => {
    if (!libraryUrl) {
      setSyncState("off");
      setSyncText("Library sync disabled.");
      setLibraryLoaded(true);
      return;
    }
    setSyncState("syncing");
    setSyncText("Syncing your library...");
    try {
      const res = await fetch(libraryUrl, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backend Error");

      const nextLibrary = {
        watchlist: data.watchlist || [],
        watchedHistory: data.watchedHistory || [],
        likedSongs: data.likedSongs || [],
        playlists: data.playlists || [],
      };
      setLibrary(nextLibrary);
      setLibraryLoaded(true);
      const total = nextLibrary.watchlist.length + nextLibrary.watchedHistory.length;
      setSyncState("ok");
      setSyncText(`Library synced - ${total} items loaded`);
    } catch (err) {
      console.error(err);
      setSyncState("error");
      setSyncText("Couldn't sync library.");
      setLibraryLoaded(true);
    }
  }, [libraryUrl]);

  const handleToggleOpen = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen && !libraryLoaded) syncLibrary();
    if (willOpen && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: `Hey! I'm your ${siteName} co-pilot. What are you looking for?`,
          modeOptions: true,
        },
      ]);
    }
  };

  // Handles the initial Song vs Movie/TV/Anime button choice.
  const selectMode = (mode) => {
    const label = mode === "song" ? "🎵 Song" : "🎬 Movie / TV / Anime";
    setMessages((prev) => [...prev, { role: "user", text: label }]);
    setSearchMode(mode);
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text:
          mode === "song"
            ? "Great — what song are you looking for?"
            : "Great — what movie, show, or anime are you looking for?",
      },
    ]);
  };

  // Real call to POST {chatUrl}/message for a given intent, attached to a card.
  const runIntent = async (intentKey, cardOrOption) => {
    const meta = getIntentMeta(cardOrOption?.mediaType, intentKey);
    setMessages((prev) => [...prev, { role: "user", text: `${meta.emoji} ${meta.label}` }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${chatUrl}/message`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: meta.label,
          buttonIntent: meta.buttonIntent,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Backend error");

      const { text, source } = formatIntentResult(intentKey, payload);

      // Mark this intent as used for this specific card, so its button
      // disappears from every place that card's actions are rendered.
      const key = `${getCardKey(cardOrOption)}-${intentKey}`;
      setUsedIntents((prev) => new Set(prev).add(key));

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          categoryResult: {
            title: meta.label,
            emoji: meta.emoji,
            body: text,
            source,
            parentCard: cardOrOption,
          },
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I couldn't fetch that just now. Try again in a moment." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Real call to POST {chatUrl}/select when user disambiguates between multiple matches.
  const selectOption = async (option) => {
    const label = option.mediaType === "song" ? `${option.title} — ${option.artist}` : `${option.title} (${option.year})`;
    setMessages((prev) => [...prev, { role: "user", text: label }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${chatUrl}/select`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, ...option }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backend error");

      setActiveCard(data.card); // mark this title as the active context
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Got it, here's what I found:", card: data.card },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, couldn't load that title. Try again?" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Free-text input handler.
  // - If no title is active yet -> POST {chatUrl}/search (new lookup, requires searchMode)
  // - If a title IS active      -> POST {chatUrl}/message (follow-up question,
  //   uses the backend's session.context so Gemini stays anchored to the
  //   currently selected movie/show/anime/song instead of re-searching)
  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isSending) return;
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsSending(true);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsTyping(true);

    try {
      if (activeCard) {
        // Follow-up question about the currently selected title
        const res = await fetch(`${chatUrl}/message`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            message: text,
          }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Backend error");

        const { text: bodyText, source } = formatIntentResult(payload.intent, payload);

        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            categoryResult: {
              title: "Follow-up",
              emoji: "💬",
              body: bodyText,
              source,
              parentCard: activeCard,
            },
          },
        ]);
      } else if (!searchMode) {
        // No mode picked yet - re-prompt instead of guessing what they want
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Just tap one of these first 👇", modeOptions: true },
        ]);
      } else {
        // No active title yet - treat this as a fresh search, scoped by searchMode
        const res = await fetch(`${chatUrl}/search`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current, query: text, mode: searchMode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Backend error");

        if (data.status === "not_found") {
          setMessages((prev) => [...prev, { role: "bot", text: data.message }]);
        } else if (data.status === "ambiguous") {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              text: "I found a few matches — which one did you mean?",
              options: data.options,
            },
          ]);
        } else if (data.status === "resolved") {
          setActiveCard(data.card); // mark this title as the active context
          setMessages((prev) => [
            ...prev,
            { role: "bot", text: "Sure! Here's what I found:", card: data.card },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I couldn't reach the assistant just now. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  };

  // Helper for JSX: is this intent already used for this card?
  const isUsed = (card, intentKey) => usedIntents.has(`${getCardKey(card)}-${intentKey}`);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes esb-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .esb-scroll::-webkit-scrollbar { width: 6px; }
        .esb-scroll::-webkit-scrollbar-thumb { background: #3a3740; border-radius: 3px; }
        .esb-textarea::placeholder { color: ${COLORS.inkFaint}; }
        .action-button {
          background: ${COLORS.reelCard};
          border: 1px solid ${COLORS.border};
          color: ${COLORS.ink};
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .action-button:hover {
          border-color: ${COLORS.marqueeGold};
          color: ${COLORS.marqueeGoldBright};
          background: ${COLORS.reelInputDark};
        }
        .option-card {
          background: ${COLORS.reelPanel};
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          padding: 10px;
          display: flex;
          gap: 10px;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .option-card:hover { border-color: ${COLORS.marqueeGold}; }
      `}</style>

      <button
        onClick={handleToggleOpen}
        aria-label="Open media assistant"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999998,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,0,0,.45)",
          transition: "transform .18s ease",
          padding: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <AnimatedOrb size={60} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            zIndex: 999999,
            width: 440,
            maxWidth: "calc(100vw - 32px)",
            height: 720,
            maxHeight: "calc(100vh - 140px)",
            background: COLORS.reelPanel,
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,.6)",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              background: COLORS.reelBlack,
              padding: "18px 20px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                background: COLORS.marqueeGold,
                borderRadius: "50%",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: COLORS.reelBlack
              }}>
                🤖
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: "#fff", fontWeight: "600" }}>{siteName}</h3>
                  <span style={{
                    fontSize: 10,
                    background: "rgba(47, 224, 208, 0.15)",
                    color: COLORS.marqueeGold,
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 0.5
                  }}>Beta</span>
                </div>
                <p style={{ margin: "2px 0 0 0", fontSize: 11.5, color: COLORS.inkDim }}>Your smart movie companion</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => {
                  setMessages([
                    {
                      role: "bot",
                      text: `Hey! I'm your ${siteName} co-pilot. What are you looking for?`,
                      modeOptions: true,
                    },
                  ]);
                  setActiveCard(null);
                  setSearchMode(null);
                  setUsedIntents(new Set()); // reset used-intent tracking too
                  sessionIdRef.current = makeSessionId();
                }}
                title="Reset Conversation"
                style={{ background: "none", border: "none", color: COLORS.inkDim, cursor: "pointer" }}
              >
                <SyncIcon />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: COLORS.inkDim, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>&times;</button>
            </div>
          </div>

          <div
            className="esb-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: COLORS.reelBlack,
            }}
          >
            {messages.map((m, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* NOTE: bot avatar bubble removed - bot messages now render
                    without the small 🤖 icon to the left */}
                {m.text && (
                  <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "12px 16px",
                        borderRadius: 16,
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        ...(m.role === "user"
                          ? {
                              background: COLORS.marqueeGold,
                              color: COLORS.reelBlack,
                              borderBottomRightRadius: 4,
                              fontWeight: "500"
                            }
                          : {
                              background: COLORS.reelCard,
                              color: COLORS.ink,
                              borderBottomLeftRadius: 4,
                              border: `1px solid ${COLORS.border}`,
                            }),
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                )}

                {/* Initial mode choice - Song vs Movie/TV/Anime */}
                {m.modeOptions && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="action-button" onClick={() => selectMode("media")}>
                      🎬 Movie / TV / Anime
                    </button>
                    <button className="action-button" onClick={() => selectMode("song")}>
                      🎵 Song
                    </button>
                  </div>
                )}

                {/* Disambiguation options (multiple matches within the chosen mode) */}
                {m.options && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.options.map((opt) => (
                      <div key={`${opt.mediaType}-${opt.tmdbId || opt.deezerId}`} className="option-card" onClick={() => selectOption(opt)}>
                        {opt.poster && (
                          <img src={opt.poster} alt={opt.title} style={{ width: 46, height: 68, borderRadius: 6, objectFit: "cover" }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 600 }}>
                            {opt.title} {opt.mediaType === "song" ? `— ${opt.artist}` : opt.year ? `(${opt.year})` : ""}
                            {opt.mediaType === "anime" ? " · Anime" : ""}
                          </div>
                          <div style={{ fontSize: 11.5, color: COLORS.inkDim, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {opt.overview}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {m.card && m.card.mediaType === "song" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{
                      background: COLORS.reelPanel,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 16,
                      padding: "16px",
                      display: "flex",
                      gap: 16,
                    }}>
                      {m.card.cover && (
                        <img
                          src={m.card.cover}
                          alt={m.card.title}
                          style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover", border: `1px solid ${COLORS.border}` }}
                        />
                      )}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 18, color: "#fff", fontWeight: "700" }}>{m.card.title}</h4>
                          <p style={{ margin: "4px 0 2px 0", fontSize: 13, color: COLORS.marqueeGoldBright }}>{m.card.artist}</p>
                          <p style={{ margin: 0, fontSize: 12, color: COLORS.inkDim }}>
                            {m.card.album}{m.card.year ? `  •  ${m.card.year}` : ""}
                          </p>
                        </div>
                        {m.card.previewUrl && (
                          <audio controls src={m.card.previewUrl} style={{ marginTop: 8, height: 32, width: "100%" }} />
                        )}
                        {m.card.deezerUrl && (
                          <a
                            href={m.card.deezerUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 12, color: COLORS.marqueeGold, marginTop: 8, textDecoration: "none" }}
                          >
                            ▶ Open Track
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Only show buttons for intents not yet used on this card */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {!isUsed(m.card, "about") && (
                        <button className="action-button" onClick={() => runIntent("about", m.card)}>🎧 About This Song</button>
                      )}
                      {!isUsed(m.card, "similar") && (
                        <button className="action-button" onClick={() => runIntent("similar", m.card)}>🔁 More From This Artist</button>
                      )}
                    </div>
                  </div>
                )}

                {m.card && m.card.mediaType !== "song" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{
                      background: COLORS.reelPanel,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 16,
                      padding: "16px",
                      display: "flex",
                      gap: 16,
                      position: "relative"
                    }}>
                      {m.card.poster && (
                        <img
                          src={m.card.poster}
                          alt={m.card.title}
                          style={{ width: 105, height: 155, borderRadius: 8, objectFit: "cover", border: `1px solid ${COLORS.border}` }}
                        />
                      )}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 20, color: "#fff", fontWeight: "700" }}>{m.card.title}</h4>
                          <p style={{ margin: "4px 0 8px 0", fontSize: 12, color: COLORS.inkDim }}>
                            {m.card.mediaType === "anime" ? "Anime" : ""}
                            {m.card.year ? `  •  ${m.card.year}` : ""}
                            {m.card.genres ? `  •  ${m.card.genres}` : ""}
                            {m.card.duration ? `  •  ${m.card.duration}` : ""}
                          </p>
                          <p style={{ margin: 0, fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5, opacity: 0.9 }}>
                            {m.card.overview}
                          </p>
                        </div>

                        {m.card.rating != null && (
                          <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
                            <div style={{ fontSize: 11, color: COLORS.inkDim }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#fff", fontWeight: "600", fontSize: 12 }}>
                                <StarIcon /> {m.card.rating}/5
                              </div>
                              TMDB
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Only show buttons for intents not yet used on this card */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {!isUsed(m.card, "story") && (
                        <button className="action-button" onClick={() => runIntent("story", m.card)}>📖 Storyline</button>
                      )}
                      {!isUsed(m.card, "cast") && (
                        <button className="action-button" onClick={() => runIntent("cast", m.card)}>🎭 Cast</button>
                      )}
                      {!isUsed(m.card, "ratings") && (
                        <button className="action-button" onClick={() => runIntent("ratings", m.card)}>⭐ Ratings</button>
                      )}
                      {!isUsed(m.card, "similar") && (
                        <button className="action-button" onClick={() => runIntent("similar", m.card)}>🔁 Similar Titles</button>
                      )}
                    </div>
                  </div>
                )}

                {m.categoryResult && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{
                      background: COLORS.reelCard,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 16,
                      padding: 16,
                      position: "relative"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>{m.categoryResult.emoji}</span>
                        <h4 style={{ margin: 0, fontSize: 15, color: "#fff", fontWeight: "600" }}>{m.categoryResult.title}</h4>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: COLORS.ink, lineHeight: 1.6 }}>
                        {m.categoryResult.body}
                      </p>
                      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: COLORS.inkFaint, fontStyle: "italic" }}>
                          {m.categoryResult.source}
                        </span>
                      </div>
                    </div>

                    {/* Remaining (unused) action buttons for this card, shown again after a follow-up result */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                      {m.categoryResult.parentCard?.mediaType === "song" ? (
                        <>
                          {!isUsed(m.categoryResult.parentCard, "about") && (
                            <button className="action-button" onClick={() => runIntent("about", m.categoryResult.parentCard)}>🎧 About This Song</button>
                          )}
                          {!isUsed(m.categoryResult.parentCard, "similar") && (
                            <button className="action-button" onClick={() => runIntent("similar", m.categoryResult.parentCard)}>🔁 More From This Artist</button>
                          )}
                        </>
                      ) : (
                        <>
                          {!isUsed(m.categoryResult.parentCard, "story") && (
                            <button className="action-button" onClick={() => runIntent("story", m.categoryResult.parentCard)}>📖 Storyline</button>
                          )}
                          {!isUsed(m.categoryResult.parentCard, "cast") && (
                            <button className="action-button" onClick={() => runIntent("cast", m.categoryResult.parentCard)}>🎭 Cast</button>
                          )}
                          {!isUsed(m.categoryResult.parentCard, "ratings") && (
                            <button className="action-button" onClick={() => runIntent("ratings", m.categoryResult.parentCard)}>⭐ Ratings</button>
                          )}
                          {!isUsed(m.categoryResult.parentCard, "similar") && (
                            <button className="action-button" onClick={() => runIntent("similar", m.categoryResult.parentCard)}>🔁 Similar Titles</button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: 14, background: COLORS.reelCard, border: `1px solid ${COLORS.border}` }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "16px 20px",
              background: COLORS.reelPanel,
              borderTop: `1px solid ${COLORS.border}`,
              flexShrink: 0,
            }}
          >
            {/* NOTE: "+" attachment button removed - input row now goes
                straight from the textarea to the send button */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                <textarea
                  ref={textareaRef}
                  className="esb-textarea"
                  rows={1}
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: "100%",
                    background: COLORS.reelInputDark,
                    border: `1px solid ${COLORS.inputBorder}`,
                    borderRadius: 24,
                    padding: "10px 16px",
                    fontSize: 13.5,
                    color: COLORS.ink,
                    outline: "none",
                    resize: "none",
                    maxHeight: 80,
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={isSending}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isSending ? COLORS.marqueeGoldDim : COLORS.marqueeGold,
                  border: "none",
                  cursor: isSending ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SendIcon />
              </button>
            </div>

            <p style={{ margin: "10px 0 0 0", fontSize: 10.5, color: COLORS.inkFaint, textAlign: "center" }}>
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}