// import { useEffect, useRef, useState } from "react";
// import { X, Search, Film, Music, PlayCircle } from "lucide-react";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// // Same shape MovieSearchModal produces for TMDB, but for Creator Hub
// // uploads: { id, source: "creator", mediaKind, title, posterUrl, thumbUrl,
// // videoUrl, audioUrl, duration, creatorName, creatorAvatar, format }.
// export default function CreatorSearchModal({ onClose, onSelect }) {
//   const [query, setQuery] = useState("");
//   const [filter, setFilter] = useState("all"); // "all" | "movie" | "music"
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const debounceRef = useRef(null);

//   // With an empty query we browse the most recent creator uploads instead
//   // of showing a blank state — this is the "find something new" flow for
//   // creator content, not just a search box.
//   useEffect(() => {
//     clearTimeout(debounceRef.current);
//     setLoading(true);
//     setError("");

//     const endpoint = query.trim()
//       ? `${API_BASE}/watchparty/creator-search?query=${encodeURIComponent(query.trim())}`
//       : `${API_BASE}/watchparty/creator-feed`;

//     debounceRef.current = setTimeout(
//       async () => {
//         try {
//           const res = await fetch(endpoint);
//           const data = await res.json();
//           if (!res.ok) throw new Error(data.error || "Couldn't load creator content");
//           setResults(data.results || []);
//         } catch (err) {
//           setError(err.message || "Couldn't load creator content");
//           setResults([]);
//         } finally {
//           setLoading(false);
//         }
//       },
//       query.trim() ? 350 : 0,
//     );

//     return () => clearTimeout(debounceRef.current);
//   }, [query]);

//   const filtered = results.filter((r) =>
//     filter === "all" ? true : r.mediaKind === filter,
//   );

//   const formatDuration = (seconds) => {
//     if (!seconds) return "";
//     const m = Math.floor(seconds / 60);
//     const s = Math.floor(seconds % 60);
//     return `${m}:${String(s).padStart(2, "0")}`;
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm">
//       <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
//         <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
//           <Search className="h-4 w-4 text-neutral-500" />
//           <input
//             autoFocus
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search Creator Hub uploads..."
//             className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
//           />
//           <button
//             onClick={onClose}
//             className="rounded-full p-1 text-neutral-500 hover:bg-white/10 hover:text-white"
//             aria-label="Close"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
//           {[
//             { key: "all", label: "All" },
//             { key: "movie", label: "Movies & Shorts" },
//             { key: "music", label: "Music" },
//           ].map((f) => (
//             <button
//               key={f.key}
//               onClick={() => setFilter(f.key)}
//               className={`rounded-full px-3 py-1 text-xs font-medium transition ${
//                 filter === f.key
//                   ? "bg-[#5CF2E3]/15 text-[#5CF2E3]"
//                   : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
//               }`}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>

//         <div className="max-h-[60vh] overflow-y-auto p-2">
//           {loading && (
//             <p className="px-3 py-6 text-center text-sm text-neutral-500">Loading…</p>
//           )}

//           {!loading && error && (
//             <p className="px-3 py-6 text-center text-sm text-red-400">{error}</p>
//           )}

//           {!loading && !error && filtered.length === 0 && (
//             <p className="px-3 py-6 text-center text-sm text-neutral-500">
//               {query.trim()
//                 ? "No matches. Try a different title."
//                 : "No creator uploads yet — check back soon."}
//             </p>
//           )}

//           {!loading &&
//             !error &&
//             filtered.map((r) => (
//               <button
//                 key={r.id}
//                 onClick={() => onSelect(r)}
//                 className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
//               >
//                 {r.thumbUrl ? (
//                   <img
//                     src={r.thumbUrl}
//                     alt=""
//                     className="h-16 w-11 shrink-0 rounded-md object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-white/5">
//                     {r.mediaKind === "music" ? (
//                       <Music className="h-4 w-4 text-neutral-600" />
//                     ) : (
//                       <Film className="h-4 w-4 text-neutral-600" />
//                     )}
//                   </div>
//                 )}
//                 <div className="min-w-0 flex-1">
//                   <p className="truncate text-sm font-medium text-white">{r.title}</p>
//                   <p className="truncate text-xs text-neutral-500">
//                     {r.creatorName}
//                     {r.duration ? ` · ${formatDuration(r.duration)}` : ""}
//                   </p>
//                 </div>
//                 <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
//                   {r.mediaKind === "music" ? (
//                     <Music className="h-3 w-3 text-[#5CF2E3]" />
//                   ) : (
//                     <PlayCircle className="h-3 w-3 text-[#5CF2E3]" />
//                   )}
//                   {r.format || r.mediaKind}
//                 </span>
//               </button>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { X, Search, Film, Music, PlayCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Section order/labels for grouping results by content type — a creator's
// uploads render as separate sections (Movies & Shorts, then Music) instead
// of one interleaved list, whether the query matched on title or on the
// creator's username.
const GROUP_ORDER = [
  { key: "movie", label: "Movies & Short Films" },
  { key: "music", label: "Music" },
];

function groupResults(list) {
  const groups = {};
  for (const r of list) {
    const key = r.mediaKind || "movie";
    (groups[key] ||= []).push(r);
  }
  return GROUP_ORDER
    .map(({ key, label }) => ({ label, items: groups[key] || [] }))
    .filter((g) => g.items.length > 0);
}

// Same shape MovieSearchModal produces for TMDB, but for Creator Hub
// uploads: { id, source: "creator", mediaKind, title, posterUrl, thumbUrl,
// videoUrl, audioUrl, duration, creatorName, creatorAvatar, format }.
export default function CreatorSearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "movie" | "music"
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  // With an empty query we browse the most recent creator uploads instead
  // of showing a blank state — this is the "find something new" flow for
  // creator content, not just a search box. A non-empty query matches on
  // both post title and creator username server-side, so searching a
  // creator's name pulls back all of their content.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setLoading(true);
    setError("");

    const endpoint = query.trim()
      ? `${API_BASE}/watchparty/creator-search?query=${encodeURIComponent(query.trim())}`
      : `${API_BASE}/watchparty/creator-feed`;

    debounceRef.current = setTimeout(
      async () => {
        try {
          const res = await fetch(endpoint);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Couldn't load creator content");
          setResults(data.results || []);
        } catch (err) {
          setError(err.message || "Couldn't load creator content");
          setResults([]);
        } finally {
          setLoading(false);
        }
      },
      query.trim() ? 350 : 0,
    );

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const filtered = results.filter((r) =>
    filter === "all" ? true : r.mediaKind === filter,
  );

  const grouped = groupResults(filtered);

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Creator Hub uploads or creators..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-500 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          {[
            { key: "all", label: "All" },
            { key: "movie", label: "Movies & Short Films" },
            { key: "music", label: "Music" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-[#5CF2E3]/15 text-[#5CF2E3]"
                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">Loading…</p>
          )}

          {!loading && error && (
            <p className="px-3 py-6 text-center text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">
              {query.trim()
                ? "No matches. Try a different title or creator name."
                : "No creator uploads yet — check back soon."}
            </p>
          )}

          {!loading &&
            !error &&
            grouped.map((group) => (
              <div key={group.label} className="mb-1">
                {/* Only show a section header when results span more than
                    one type — a single-type set (e.g. the Music tab, or a
                    creator who's only posted music) stays a plain list. */}
                {grouped.length > 1 && (
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {group.label}
                  </p>
                )}
                {group.items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelect(r)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
                  >
                    {r.thumbUrl ? (
                      <img
                        src={r.thumbUrl}
                        alt=""
                        className="h-16 w-11 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-white/5">
                        {r.mediaKind === "music" ? (
                          <Music className="h-4 w-4 text-neutral-600" />
                        ) : (
                          <Film className="h-4 w-4 text-neutral-600" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{r.title}</p>
                      <p className="truncate text-xs text-neutral-500">
                        {r.creatorName}
                        {r.duration ? ` · ${formatDuration(r.duration)}` : ""}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                      {r.mediaKind === "music" ? (
                        <Music className="h-3 w-3 text-[#5CF2E3]" />
                      ) : (
                        <PlayCircle className="h-3 w-3 text-[#5CF2E3]" />
                      )}
                      {r.format || r.mediaKind}
                    </span>
                  </button>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}