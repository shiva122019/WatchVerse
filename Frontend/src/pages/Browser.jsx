// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import api from "@/lib/api";
// import MediaCard from "@/components/MediaCard";
// import MusicMediaCard from "@/components/MusicMediaCard";
// import { Search } from "lucide-react";

// const TYPES = [
//   { value: "", label: "All" },
//   { value: "movie", label: "Movies" },
//   { value: "series", label: "Series" },
//   { value: "song", label: "Music" },
// ];

// const MOVIE_SERIES_GENRES = [
//   "Drama",
//   "Sci-Fi",
//   "Thriller",
//   "Mystery",
//   "Action",
//   "Comedy",
//   "Romance",
//   "Horror",
//   "Fantasy",
// ];

// const MUSIC_GENRES = ["Synthwave", "Indie", "Pop", "Jazz", "Folk"];

// export default function Browse() {
//   const [params, setParams] = useSearchParams();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const type = params.get("type") || "";
//   const genre = params.get("genre") || "";
//   const q = params.get("q") || "";

//   const [searchInput, setSearchInput] = useState(q);

//   // Which genre list applies to the currently selected type.
//   const activeGenres = type === "song" ? MUSIC_GENRES : MOVIE_SERIES_GENRES;

//   useEffect(() => {
//     setPage(1);
//     setHasMore(true);
//   }, [type, genre, q]);

//   useEffect(() => {
//     let active = true;

//     if (page === 1) {
//       setLoading(true);
//       setItems([]);
//     } else {
//       setLoadingMore(true);
//     }

//     api
//       .get("/home/queryContent", {
//         params: {
//           ...(type ? { type } : {}),
//           ...(genre ? { genre } : {}),
//           ...(q ? { q } : {}),
//           page,
//         },
//       })
//       .then((r) => {
//         if (!active) return;

//         // The song endpoint returns { results, page, hasMore }.
//         // Movie/series/all endpoints return a bare array.
//         const isPaginatedShape =
//           r.data && !Array.isArray(r.data) && Array.isArray(r.data.results);

//         const newItems = isPaginatedShape ? r.data.results : r.data || [];

//         setItems((prev) => {
//           if (page === 1) {
//             return newItems;
//           }
//           const combined = [...prev, ...newItems];
//           const seen = new Set();
//           return combined.filter((it) => {
//             const key = `${it.type}-${it.id}`;
//             if (seen.has(key)) return false;
//             seen.add(key);
//             return true;
//           });
//         });

//         if (isPaginatedShape) {
//           setHasMore(Boolean(r.data.hasMore));
//         } else if (newItems.length === 0) {
//           setHasMore(false);
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         setHasMore(false);
//       })
//       .finally(() => {
//         if (active) {
//           setLoading(false);
//           setLoadingMore(false);
//         }
//       });

//     return () => {
//       active = false;
//     };
//   }, [type, genre, q, page]);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (loading || loadingMore || !hasMore) return;
//       if (
//         window.innerHeight + window.scrollY >=
//         document.documentElement.scrollHeight - 300
//       ) {
//         setPage((prev) => prev + 1);
//       }
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [loading, loadingMore, hasMore]);

//   const updateParam = (key, value) => {
//     const next = new URLSearchParams(params);

//     if (value) next.set(key, value);
//     else next.delete(key);

//     // Switching content type: drop the current genre if it doesn't
//     // belong to the new type's genre list (e.g. "Folk" selected,
//     // then switching to Movies — Folk isn't a movie genre).
//     if (key === "type") {
//       const newGenreList =
//         value === "song" ? MUSIC_GENRES : MOVIE_SERIES_GENRES;
//       const currentGenre = params.get("genre");

//       if (currentGenre && !newGenreList.includes(currentGenre)) {
//         next.delete("genre");
//       }
//     }

//     setParams(next);
//   };

//   const onSearch = (e) => {
//     e.preventDefault();
//     updateParam("q", searchInput.trim());
//   };

//   return (
//     <div
//       className="mx-auto max-w-7xl px-6 py-12 md:px-10"
//       data-testid="browse-page"
//     >
//       <div className="mb-8 flex flex-col gap-2">
//         <span className="label-caps text-cyan">Catalog</span>
//         <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
//           Browse Everything
//         </h1>
//       </div>

//       {/* Search */}
//       <form
//         onSubmit={onSearch}
//         className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3"
//       >
//         <Search className="h-5 w-5 text-neutral-500" />
//         <input
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//           placeholder="Search titles, creators, cast…"
//           className="w-full bg-transparent text-base text-white placeholder:text-neutral-500 focus:outline-none"
//           data-testid="browse-search-input"
//         />
//         <button
//           type="submit"
//           data-testid="browse-search-submit"
//           className="rounded-full border border-[#00F0FF] px-4 py-1.5 text-xs font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black"
//         >
//           Search
//         </button>
//       </form>

//       {/* Type filters */}
//       <div className="mb-4 flex flex-wrap gap-2">
//         {TYPES.map((t) => (
//           <button
//             key={t.value || "all"}
//             onClick={() => updateParam("type", t.value)}
//             data-testid={`filter-type-${t.value || "all"}`}
//             className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition ${
//               type === t.value
//                 ? "border-[#00F0FF] bg-[#00F0FF] text-black"
//                 : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
//             }`}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {/* Genre chips — swap list based on selected type */}
//       <div className="mb-10 flex flex-wrap gap-2">
//         <button
//           onClick={() => updateParam("genre", "")}
//           data-testid="filter-genre-all"
//           className={`rounded-full border px-3 py-1 text-[11px] font-medium tracking-wider transition ${
//             !genre
//               ? "border-[#FFB300] text-[#FFB300]"
//               : "border-white/10 text-neutral-400 hover:border-white/30 hover:text-neutral-200"
//           }`}
//         >
//           All Genres
//         </button>
//         {activeGenres.map((g) => (
//           <button
//             key={g}
//             onClick={() => updateParam("genre", g)}
//             data-testid={`filter-genre-${g}`}
//             className={`rounded-full border px-3 py-1 text-[11px] font-medium tracking-wider transition ${
//               genre === g
//                 ? "border-[#FFB300] text-[#FFB300]"
//                 : "border-white/10 text-neutral-400 hover:border-white/30 hover:text-neutral-200"
//             }`}
//           >
//             {g}
//           </button>
//         ))}
//       </div>

//       {loading && page === 1 ? (
//         <div className="py-20 text-center text-neutral-500">Loading…</div>
//       ) : items.length === 0 ? (
//         <div
//           data-testid="browse-empty"
//           className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center"
//         >
//           <p className="font-display text-2xl text-white">No results</p>
//           <p className="mt-2 text-sm text-neutral-500">
//             Try clearing filters or a different search term.
//           </p>
//         </div>
//       ) : (
//         <>
//           <div
//             className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
//             data-testid="browse-grid"
//           >
//             {type === "song"
//               ? items.map((song) => (
//                   <MusicMediaCard key={song.id} item={song} width="w-full" />
//                 ))
//               : items.map((item) => (
//                   <MediaCard key={item.id} item={item} width="w-full" />
//                 ))}
//           </div>
//           {loadingMore && (
//             <div className="py-10 text-center text-neutral-500">
//               Loading more…
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import api from "@/lib/api";
// import MediaCard from "@/components/MediaCard";
// import MusicMediaCard from "@/components/MusicMediaCard";
// import { Search, X } from "lucide-react";

// const TYPES = [
//   { value: "movie", label: "Movies" },
//   { value: "series", label: "Series" },
//   { value: "song", label: "Music" },
// ];

// const MOVIE_SERIES_GENRES = [
//   "Drama",
//   "Sci-Fi",
//   "Thriller",
//   "Mystery",
//   "Action",
//   "Comedy",
//   "Romance",
//   "Horror",
//   "Fantasy",
// ];

// const MUSIC_GENRES = ["Synthwave", "Indie", "Pop", "Jazz", "Folk"];

// const GENRES_VISIBLE_COUNT = 5;

// const YEARS_VISIBLE = [2026, 2025, 2024, 2023, 2022, 2021];
// const YEARS_MORE = [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

// const RATINGS_VISIBLE = [
//   { value: "", label: "Any" },
//   { value: "4.0", label: "4.0+" },
//   { value: "3.5", label: "3.5+" },
//   { value: "3.0", label: "3.0+" },
// ];
// const RATINGS_MORE = [
//   { value: "2.5", label: "2.5+" },
//   { value: "2.0", label: "2.0+" },
// ];

// const SORT_OPTIONS = [
//   { value: "popularity", label: "Popularity" },
//   { value: "rating", label: "Top Rated" },
//   { value: "newest", label: "Newest" },
//   { value: "title", label: "Title A-Z" },
// ];

// const chipClass = (active) =>
//   `rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition ${
//     active
//       ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]"
//       : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
//   }`;

// export default function Browse() {
//   const [params, setParams] = useSearchParams();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   // ---- Applied filters (drive the actual fetch, live in the URL) ----
//   // Read straight from the URL on every render/mount — including on a
//   // browser reload — so whatever's already there (e.g. type=movie) stays
//   // selected. Filters are only cleared explicitly: switching content type
//   // (onSelectType) or clicking Reset all/Clear all.
//   const type = params.get("type") || "";
//   const q = params.get("q") || "";
//   const appliedGenres = (params.get("genres") || "")
//     .split(",")
//     .filter(Boolean);
//   const appliedYear = params.get("year") || "";
//   const appliedRating = params.get("rating") || "";
//   const sortBy = params.get("sortBy") || "popularity";

//   const [searchInput, setSearchInput] = useState(q);

//   // Keep the search box in sync when filters are cleared/reset elsewhere
//   // (Reset all, type switch, mount reset) so it doesn't show stale text.
//   useEffect(() => {
//     setSearchInput(q);
//   }, [q]);

//   const [showAllGenres, setShowAllGenres] = useState(false);
//   const [showAllYears, setShowAllYears] = useState(false);
//   const [showAllRatings, setShowAllRatings] = useState(false);

//   const activeGenreOptions = type === "song" ? MUSIC_GENRES : MOVIE_SERIES_GENRES;
//   const visibleGenreOptions = showAllGenres
//     ? activeGenreOptions
//     : activeGenreOptions.slice(0, GENRES_VISIBLE_COUNT);
//   const visibleYears = showAllYears ? [...YEARS_VISIBLE, ...YEARS_MORE] : YEARS_VISIBLE;
//   const visibleRatings = showAllRatings
//     ? [...RATINGS_VISIBLE, ...RATINGS_MORE]
//     : RATINGS_VISIBLE;

//   useEffect(() => {
//     setPage(1);
//     setHasMore(true);
//   }, [type, appliedGenres.join(","), appliedYear, appliedRating, sortBy, q]);

//   useEffect(() => {
//     let active = true;

//     if (page === 1) {
//       setLoading(true);
//       setItems([]);
//     } else {
//       setLoadingMore(true);
//     }

//     api
//       .get("/home/queryContent", {
//         params: {
//           ...(type ? { type } : {}),
//           ...(appliedGenres.length ? { genres: appliedGenres.join(",") } : {}),
//           ...(appliedYear ? { year: appliedYear } : {}),
//           ...(appliedRating ? { rating: appliedRating } : {}),
//           ...(sortBy ? { sortBy } : {}),
//           ...(q ? { q } : {}),
//           page,
//         },
//       })
//       .then((r) => {
//         if (!active) return;

//         // The song endpoint returns { results, page, hasMore }.
//         // Movie/series/all endpoints return a bare array.
//         const isPaginatedShape =
//           r.data && !Array.isArray(r.data) && Array.isArray(r.data.results);

//         const newItems = isPaginatedShape ? r.data.results : r.data || [];

//         setItems((prev) => {
//           if (page === 1) {
//             return newItems;
//           }
//           const combined = [...prev, ...newItems];
//           const seen = new Set();
//           return combined.filter((it) => {
//             const key = `${it.type}-${it.id}`;
//             if (seen.has(key)) return false;
//             seen.add(key);
//             return true;
//           });
//         });

//         if (isPaginatedShape) {
//           setHasMore(Boolean(r.data.hasMore));
//         } else if (newItems.length === 0) {
//           setHasMore(false);
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         setHasMore(false);
//       })
//       .finally(() => {
//         if (active) {
//           setLoading(false);
//           setLoadingMore(false);
//         }
//       });

//     return () => {
//       active = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [type, appliedGenres.join(","), appliedYear, appliedRating, sortBy, q, page]);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (loading || loadingMore || !hasMore) return;
//       if (
//         window.innerHeight + window.scrollY >=
//         document.documentElement.scrollHeight - 300
//       ) {
//         setPage((prev) => prev + 1);
//       }
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [loading, loadingMore, hasMore]);

//   const updateParam = (key, value) => {
//     const next = new URLSearchParams(params);
//     if (value) next.set(key, value);
//     else next.delete(key);
//     setParams(next);
//   };

//   const onSearch = (e) => {
//     e.preventDefault();
//     updateParam("q", searchInput.trim());
//   };

//   // Content type applies immediately (it changes what the whole page is
//   // browsing). Clicking the already-active type deselects it.
//   //
//   // Switching type — or deselecting it — wipes every other filter
//   // (genres, year, rating, sort, search) rather than just pruning
//   // genres, since "Top Rated Sci-Fi from 2022" for Movies doesn't carry
//   // any sensible meaning once you're looking at Music.
//   const onSelectType = (value) => {
//     const nextType = value === type ? "" : value;
//     const next = new URLSearchParams();

//     if (nextType) next.set("type", nextType);

//     setSearchInput("");
//     setParams(next);
//   };

//   const onSortChange = (value) => {
//     updateParam("sortBy", value);
//   };

//   // Every filter click writes straight to the URL and applies immediately —
//   // no separate "staged" state to fall out of sync with what's actually
//   // being fetched.
//   const toggleGenre = (g) => {
//     const next = new URLSearchParams(params);
//     const nextGenres = appliedGenres.includes(g)
//       ? appliedGenres.filter((x) => x !== g)
//       : [...appliedGenres, g];

//     if (nextGenres.length) next.set("genres", nextGenres.join(","));
//     else next.delete("genres");

//     setParams(next);
//   };

//   const clearGenres = () => updateParam("genres", "");

//   const setYear = (y) => updateParam("year", y);

//   const setRating = (r) => updateParam("rating", r);

//   const resetAll = () => {
//     setSearchInput("");
//     setParams(new URLSearchParams());
//   };

//   const removeGenreChip = (g) => {
//     const next = appliedGenres.filter((x) => x !== g);
//     const params2 = new URLSearchParams(params);
//     if (next.length) params2.set("genres", next.join(","));
//     else params2.delete("genres");
//     setParams(params2);
//   };

//   const hasActiveFilters =
//     type || appliedGenres.length > 0 || appliedYear || appliedRating || q;

//   return (
//     <div
//       className="mx-auto max-w-7xl px-6 py-12 md:px-10"
//       data-testid="browse-page"
//     >
//       <div className="mb-8 flex flex-col gap-2">
//         <span className="label-caps text-cyan">Catalog</span>
//         <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
//           Browse Everything
//         </h1>
//       </div>

//       {/* Search */}
//       <form
//         onSubmit={onSearch}
//         className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3"
//       >
//         <Search className="h-5 w-5 text-neutral-500" />
//         <input
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//           placeholder="Search titles, creators, cast…"
//           className="w-full bg-transparent text-base text-white placeholder:text-neutral-500 focus:outline-none"
//           data-testid="browse-search-input"
//         />
//         <button
//           type="submit"
//           data-testid="browse-search-submit"
//           className="rounded-full border border-[#00F0FF] px-4 py-1.5 text-xs font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black"
//         >
//           Search
//         </button>
//       </form>

//       <div className="flex flex-col gap-8 lg:flex-row">
//         {/* ---------------- Sidebar ---------------- */}
//         <aside className="w-full shrink-0 lg:w-72">
//           <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
//             <div className="mb-6 flex items-center justify-between">
//               <h2 className="font-display text-lg font-semibold text-white">
//                 Filters
//               </h2>
//               <button
//                 onClick={resetAll}
//                 data-testid="filters-reset-all"
//                 className="text-xs font-semibold text-[#00F0FF] hover:underline"
//               >
//                 Reset all
//               </button>
//             </div>

//             {/* Content Type */}
//             <div className="mb-6">
//               <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
//                 Content Type
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {TYPES.map((t) => (
//                   <button
//                     key={t.value}
//                     onClick={() => onSelectType(t.value)}
//                     data-testid={`filter-type-${t.value}`}
//                     className={chipClass(type === t.value)}
//                   >
//                     {t.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Genres (multi-select, applies instantly) */}
//             <div className="mb-6">
//               <div className="mb-3 flex items-center justify-between">
//                 <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
//                   Genres
//                 </p>
//                 <button
//                   onClick={() => setShowAllGenres((v) => !v)}
//                   className="text-xs font-semibold text-[#00F0FF] hover:underline"
//                 >
//                   {showAllGenres ? "Show less" : "See all"}
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   onClick={clearGenres}
//                   data-testid="filter-genre-all"
//                   className={chipClass(appliedGenres.length === 0)}
//                 >
//                   All Genres
//                 </button>
//                 {visibleGenreOptions.map((g) => (
//                   <button
//                     key={g}
//                     onClick={() => toggleGenre(g)}
//                     data-testid={`filter-genre-${g}`}
//                     className={chipClass(appliedGenres.includes(g))}
//                   >
//                     {g}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Year (single-select, applies instantly) */}
//             <div className="mb-6">
//               <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
//                 Year
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   onClick={() => setYear("")}
//                   data-testid="filter-year-any"
//                   className={chipClass(appliedYear === "")}
//                 >
//                   Any
//                 </button>
//                 {visibleYears.map((y) => (
//                   <button
//                     key={y}
//                     onClick={() => setYear(String(y))}
//                     data-testid={`filter-year-${y}`}
//                     className={chipClass(appliedYear === String(y))}
//                   >
//                     {y}
//                   </button>
//                 ))}
//               </div>
//               <button
//                 onClick={() => setShowAllYears((v) => !v)}
//                 className="mt-2 text-xs font-semibold text-neutral-400 hover:text-white"
//               >
//                 {showAllYears ? "− Less" : "+ More"}
//               </button>
//             </div>

//             {/* Rating (single-select, applies instantly) — hidden for
//                 Music, since the rating filter doesn't apply to songs. */}
//             {type !== "song" && (
//               <div className="mb-6">
//                 <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
//                   Rating
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {visibleRatings.map((r) => (
//                     <button
//                       key={r.value || "any"}
//                       onClick={() => setRating(r.value)}
//                       data-testid={`filter-rating-${r.value || "any"}`}
//                       className={chipClass(appliedRating === r.value)}
//                     >
//                       {r.label}
//                     </button>
//                   ))}
//                 </div>
//                 <button
//                   onClick={() => setShowAllRatings((v) => !v)}
//                   className="mt-2 text-xs font-semibold text-neutral-400 hover:text-white"
//                 >
//                   {showAllRatings ? "− Less" : "+ More"}
//                 </button>
//               </div>
//             )}
//           </div>
//         </aside>

//         {/* ---------------- Results ---------------- */}
//         <div className="min-w-0 flex-1">
//           {/* Applied filter chips + sort */}
//           <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//             <div className="flex flex-wrap items-center gap-2">
//               {type && (
//                 <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   {TYPES.find((t) => t.value === type)?.label}
//                   <button onClick={() => onSelectType(type)} aria-label="Remove type filter">
//                     <X className="h-3 w-3" />
//                   </button>
//                 </span>
//               )}

//               {appliedGenres.length === 0 ? (
//                 <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   All Genres
//                 </span>
//               ) : (
//                 appliedGenres.map((g) => (
//                   <span
//                     key={g}
//                     className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300"
//                   >
//                     {g}
//                     <button onClick={() => removeGenreChip(g)} aria-label={`Remove ${g} filter`}>
//                       <X className="h-3 w-3" />
//                     </button>
//                   </span>
//                 ))
//               )}

//               {appliedYear && (
//                 <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   {appliedYear}
//                   <button onClick={() => updateParam("year", "")} aria-label="Remove year filter">
//                     <X className="h-3 w-3" />
//                   </button>
//                 </span>
//               )}

//               {appliedRating && type !== "song" && (
//                 <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   {appliedRating}+
//                   <button onClick={() => updateParam("rating", "")} aria-label="Remove rating filter">
//                     <X className="h-3 w-3" />
//                   </button>
//                 </span>
//               )}

//               {hasActiveFilters && (
//                 <button
//                   onClick={resetAll}
//                   data-testid="filters-clear-all"
//                   className="text-xs font-semibold text-[#00F0FF] hover:underline"
//                 >
//                   Clear all
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-2 text-sm">
//               <span className="text-neutral-500">Sort by</span>
//               <select
//                 value={sortBy}
//                 onChange={(e) => onSortChange(e.target.value)}
//                 data-testid="browse-sort"
//                 className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
//               >
//                 {SORT_OPTIONS.map((opt) => (
//                   <option key={opt.value} value={opt.value} className="bg-black">
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {loading && page === 1 ? (
//             <div className="py-20 text-center text-neutral-500">Loading…</div>
//           ) : items.length === 0 ? (
//             <div
//               data-testid="browse-empty"
//               className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center"
//             >
//               <p className="font-display text-2xl text-white">No results</p>
//               <p className="mt-2 text-sm text-neutral-500">
//                 Try clearing filters or a different search term.
//               </p>
//             </div>
//           ) : (
//             <>
//               <div
//                 className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4"
//                 data-testid="browse-grid"
//               >
//                 {type === "song"
//                   ? items.map((song) => (
//                       <MusicMediaCard key={song.id} item={song} width="w-full" />
//                     ))
//                   : items.map((item) => (
//                       <MediaCard key={item.id} item={item} width="w-full" />
//                     ))}
//               </div>
//               {loadingMore && (
//                 <div className="py-10 text-center text-neutral-500">
//                   Loading more…
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import api from "@/lib/api";
// import MediaCard from "@/components/MediaCard";
// import MusicMediaCard from "@/components/MusicMediaCard";
// import { Search, X } from "lucide-react";

// const TYPES = [
//   { value: "movie", label: "Movies" },
//   { value: "series", label: "Series" },
//   { value: "song", label: "Music" },
// ];

// const MOVIE_SERIES_GENRES = [
//   "Drama",
//   "Sci-Fi",
//   "Thriller",
//   "Mystery",
//   "Action",
//   "Comedy",
//   "Romance",
//   "Horror",
//   "Fantasy",
// ];

// const MUSIC_GENRES = ["Synthwave", "Indie", "Pop", "Jazz", "Folk"];

// const GENRES_VISIBLE_COUNT = 5;

// const YEARS_VISIBLE = [2026, 2025, 2024, 2023, 2022, 2021];
// const YEARS_MORE = [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

// const RATINGS_VISIBLE = [
//   { value: "", label: "Any" },
//   { value: "4.0", label: "4.0+" },
//   { value: "3.5", label: "3.5+" },
//   { value: "3.0", label: "3.0+" },
// ];
// const RATINGS_MORE = [
//   { value: "2.5", label: "2.5+" },
//   { value: "2.0", label: "2.0+" },
// ];

// const SORT_OPTIONS = [
//   { value: "popularity", label: "Popularity" },
//   { value: "rating", label: "Top Rated" },
//   { value: "newest", label: "Newest" },
//   { value: "title", label: "Title A-Z" },
// ];

// const chipClass = (active) =>
//   `rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition sm:px-4 sm:py-1.5 sm:text-xs ${
//     active
//       ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]"
//       : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
//   }`;

// export default function Browse() {
//   const [params, setParams] = useSearchParams();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   // ---- Applied filters (drive the actual fetch, live in the URL) ----
//   // Read straight from the URL on every render/mount — including on a
//   // browser reload — so whatever's already there (e.g. type=movie) stays
//   // selected. Filters are only cleared explicitly: switching content type
//   // (onSelectType) or clicking Reset all/Clear all.
//   const type = params.get("type") || "";
//   const q = params.get("q") || "";
//   const appliedGenres = (params.get("genres") || "")
//     .split(",")
//     .filter(Boolean);
//   const appliedYear = params.get("year") || "";
//   const appliedRating = params.get("rating") || "";
//   const sortBy = params.get("sortBy") || "popularity";

//   const [searchInput, setSearchInput] = useState(q);

//   // Keep the search box in sync when filters are cleared/reset elsewhere
//   // (Reset all, type switch, mount reset) so it doesn't show stale text.
//   useEffect(() => {
//     setSearchInput(q);
//   }, [q]);

//   useEffect(() => {
//   const navEntry = performance.getEntriesByType("navigation")[0];
//   const isReload = navEntry?.type === "reload";

//   if (isReload && params.get("q")) {
//     const next = new URLSearchParams(params);
//     next.delete("q");
//     setParams(next, { replace: true });
//   }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

//   const [showAllGenres, setShowAllGenres] = useState(false);
//   const [showAllYears, setShowAllYears] = useState(false);
//   const [showAllRatings, setShowAllRatings] = useState(false);
//   // Sidebar is collapsed by default on mobile (<lg) and toggled open via
//   // the "Filters" button; on lg+ screens it's always visible regardless
//   // of this state (see the `lg:block` override on the <aside> below).
//   const [showFilters, setShowFilters] = useState(false);

//   const activeGenreOptions = type === "song" ? MUSIC_GENRES : MOVIE_SERIES_GENRES;
//   const visibleGenreOptions = showAllGenres
//     ? activeGenreOptions
//     : activeGenreOptions.slice(0, GENRES_VISIBLE_COUNT);
//   const visibleYears = showAllYears ? [...YEARS_VISIBLE, ...YEARS_MORE] : YEARS_VISIBLE;
//   const visibleRatings = showAllRatings
//     ? [...RATINGS_VISIBLE, ...RATINGS_MORE]
//     : RATINGS_VISIBLE;

//   useEffect(() => {
//     setPage(1);
//     setHasMore(true);
//   }, [type, appliedGenres.join(","), appliedYear, appliedRating, sortBy, q]);

//   useEffect(() => {
//     let active = true;

//     if (page === 1) {
//       setLoading(true);
//       setItems([]);
//     } else {
//       setLoadingMore(true);
//     }

//     api
//       .get("/home/queryContent", {
//         params: {
//           ...(type ? { type } : {}),
//           ...(appliedGenres.length ? { genres: appliedGenres.join(",") } : {}),
//           ...(appliedYear ? { year: appliedYear } : {}),
//           ...(appliedRating ? { rating: appliedRating } : {}),
//           ...(sortBy ? { sortBy } : {}),
//           ...(q ? { q } : {}),
//           page,
//         },
//       })
//       .then((r) => {
//         if (!active) return;

//         // The song endpoint returns { results, page, hasMore }.
//         // Movie/series/all endpoints return a bare array.
//         const isPaginatedShape =
//           r.data && !Array.isArray(r.data) && Array.isArray(r.data.results);

//         const newItems = isPaginatedShape ? r.data.results : r.data || [];

//         setItems((prev) => {
//           if (page === 1) {
//             return newItems;
//           }
//           const combined = [...prev, ...newItems];
//           const seen = new Set();
//           return combined.filter((it) => {
//             const key = `${it.type}-${it.id}`;
//             if (seen.has(key)) return false;
//             seen.add(key);
//             return true;
//           });
//         });

//         if (isPaginatedShape) {
//           setHasMore(Boolean(r.data.hasMore));
//         } else if (newItems.length === 0) {
//           setHasMore(false);
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         setHasMore(false);
//       })
//       .finally(() => {
//         if (active) {
//           setLoading(false);
//           setLoadingMore(false);
//         }
//       });

//     return () => {
//       active = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [type, appliedGenres.join(","), appliedYear, appliedRating, sortBy, q, page]);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (loading || loadingMore || !hasMore) return;
//       if (
//         window.innerHeight + window.scrollY >=
//         document.documentElement.scrollHeight - 300
//       ) {
//         setPage((prev) => prev + 1);
//       }
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [loading, loadingMore, hasMore]);

//   const updateParam = (key, value) => {
//     const next = new URLSearchParams(params);
//     if (value) next.set(key, value);
//     else next.delete(key);
//     setParams(next);
//   };

//   const onSearch = (e) => {
//     e.preventDefault();
//     updateParam("q", searchInput.trim());
//   };

//   // Content type applies immediately (it changes what the whole page is
//   // browsing). Clicking the already-active type deselects it.
//   //
//   // Switching type — or deselecting it — wipes every other filter
//   // (genres, year, rating, sort, search) rather than just pruning
//   // genres, since "Top Rated Sci-Fi from 2022" for Movies doesn't carry
//   // any sensible meaning once you're looking at Music.
//   const onSelectType = (value) => {
//     const nextType = value === type ? "" : value;
//     const next = new URLSearchParams();

//     if (nextType) next.set("type", nextType);

//     setSearchInput("");
//     setParams(next);
//   };

//   const onSortChange = (value) => {
//     updateParam("sortBy", value);
//   };

//   // Every filter click writes straight to the URL and applies immediately —
//   // no separate "staged" state to fall out of sync with what's actually
//   // being fetched.
//   const toggleGenre = (g) => {
//     const next = new URLSearchParams(params);
//     const nextGenres = appliedGenres.includes(g)
//       ? appliedGenres.filter((x) => x !== g)
//       : [...appliedGenres, g];

//     if (nextGenres.length) next.set("genres", nextGenres.join(","));
//     else next.delete("genres");

//     setParams(next);
//   };

//   const clearGenres = () => updateParam("genres", "");

//   const setYear = (y) => updateParam("year", y);

//   const setRating = (r) => updateParam("rating", r);

//   const resetAll = () => {
//     setSearchInput("");
//     setParams(new URLSearchParams());
//   };

//   const removeGenreChip = (g) => {
//     const next = appliedGenres.filter((x) => x !== g);
//     const params2 = new URLSearchParams(params);
//     if (next.length) params2.set("genres", next.join(","));
//     else params2.delete("genres");
//     setParams(params2);
//   };

//   const hasActiveFilters =
//     type || appliedGenres.length > 0 || appliedYear || appliedRating || q;

//   return (
//     <div
//       className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-10"
//       data-testid="browse-page"
//     >
//       <div className="mb-6 flex flex-col gap-2 sm:mb-8">
//         <span className="label-caps text-cyan">Catalog</span>
//         <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
//           Browse Everything
//         </h1>
//       </div>

//       {/* Search */}
//       <form
//         onSubmit={onSearch}
//         className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 sm:mb-8 sm:gap-3 sm:px-5 sm:py-3"
//       >
//         <Search className="h-5 w-5 shrink-0 text-neutral-500" />
//         <input
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//           placeholder="Search titles, creators, cast…"
//           className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none sm:text-base"
//           data-testid="browse-search-input"
//         />
//         <button
//           type="submit"
//           data-testid="browse-search-submit"
//           className="shrink-0 rounded-full border border-[#00F0FF] px-3 py-1.5 text-xs font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black sm:px-4"
//         >
//           Search
//         </button>
//       </form>

//       {/* Mobile-only filters toggle */}
//       <button
//         onClick={() => setShowFilters((v) => !v)}
//         data-testid="filters-toggle-mobile"
//         className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white lg:hidden"
//       >
//         <span>Filters{hasActiveFilters ? " (active)" : ""}</span>
//         <span className="text-xs text-[#00F0FF]">
//           {showFilters ? "Hide" : "Show"}
//         </span>
//       </button>

//       <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
//         {/* ---------------- Sidebar ---------------- */}
//         <aside
//           className={`w-full shrink-0 lg:block lg:w-72 ${
//             showFilters ? "block" : "hidden"
//           }`}
//         >
//           <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
//             <div className="mb-4 flex items-center justify-between sm:mb-6">
//               <h2 className="font-display text-base font-semibold text-white sm:text-lg">
//                 Filters
//               </h2>
//               <button
//                 onClick={resetAll}
//                 data-testid="filters-reset-all"
//                 className="text-[11px] font-semibold text-[#00F0FF] hover:underline sm:text-xs"
//               >
//                 Reset all
//               </button>
//             </div>

//             {/* Content Type */}
//             <div className="mb-4 sm:mb-6">
//               <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:mb-3 sm:text-xs">
//                 Content Type
//               </p>
//               <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                 {TYPES.map((t) => (
//                   <button
//                     key={t.value}
//                     onClick={() => onSelectType(t.value)}
//                     data-testid={`filter-type-${t.value}`}
//                     className={chipClass(type === t.value)}
//                   >
//                     {t.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Genres (multi-select, applies instantly) */}
//             <div className="mb-4 sm:mb-6">
//               <div className="mb-2 flex items-center justify-between sm:mb-3">
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:text-xs">
//                   Genres
//                 </p>
//                 <button
//                   onClick={() => setShowAllGenres((v) => !v)}
//                   className="text-[11px] font-semibold text-[#00F0FF] hover:underline sm:text-xs"
//                 >
//                   {showAllGenres ? "Show less" : "See all"}
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                 <button
//                   onClick={clearGenres}
//                   data-testid="filter-genre-all"
//                   className={chipClass(appliedGenres.length === 0)}
//                 >
//                   All Genres
//                 </button>
//                 {visibleGenreOptions.map((g) => (
//                   <button
//                     key={g}
//                     onClick={() => toggleGenre(g)}
//                     data-testid={`filter-genre-${g}`}
//                     className={chipClass(appliedGenres.includes(g))}
//                   >
//                     {g}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Year (single-select, applies instantly) */}
//             <div className="mb-4 sm:mb-6">
//               <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:mb-3 sm:text-xs">
//                 Year
//               </p>
//               <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                 <button
//                   onClick={() => setYear("")}
//                   data-testid="filter-year-any"
//                   className={chipClass(appliedYear === "")}
//                 >
//                   Any
//                 </button>
//                 {visibleYears.map((y) => (
//                   <button
//                     key={y}
//                     onClick={() => setYear(String(y))}
//                     data-testid={`filter-year-${y}`}
//                     className={chipClass(appliedYear === String(y))}
//                   >
//                     {y}
//                   </button>
//                 ))}
//               </div>
//               <button
//                 onClick={() => setShowAllYears((v) => !v)}
//                 className="mt-2 text-[11px] font-semibold text-neutral-400 hover:text-white sm:text-xs"
//               >
//                 {showAllYears ? "− Less" : "+ More"}
//               </button>
//             </div>

//             {/* Rating (single-select, applies instantly) — hidden for
//                 Music, since the rating filter doesn't apply to songs. */}
//             {type !== "song" && (
//               <div className="mb-4 sm:mb-6">
//                 <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:mb-3 sm:text-xs">
//                   Rating
//                 </p>
//                 <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                   {visibleRatings.map((r) => (
//                     <button
//                       key={r.value || "any"}
//                       onClick={() => setRating(r.value)}
//                       data-testid={`filter-rating-${r.value || "any"}`}
//                       className={chipClass(appliedRating === r.value)}
//                     >
//                       {r.label}
//                     </button>
//                   ))}
//                 </div>
//                 <button
//                   onClick={() => setShowAllRatings((v) => !v)}
//                   className="mt-2 text-[11px] font-semibold text-neutral-400 hover:text-white sm:text-xs"
//                 >
//                   {showAllRatings ? "− Less" : "+ More"}
//                 </button>
//               </div>
//             )}
//           </div>
//         </aside>

//         {/* ---------------- Results ---------------- */}
//         <div className="min-w-0 flex-1">
//           {/* Applied filter chips + sort */}
//           <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
//             <div className="flex flex-wrap items-center gap-2">
//               {type && (
//                 <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   {TYPES.find((t) => t.value === type)?.label}
//                   <button onClick={() => onSelectType(type)} aria-label="Remove type filter">
//                     <X className="h-3 w-3" />
//                   </button>
//                 </span>
//               )}

//               {appliedGenres.length === 0 ? (
//                 <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   All Genres
//                 </span>
//               ) : (
//                 appliedGenres.map((g) => (
//                   <span
//                     key={g}
//                     className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300"
//                   >
//                     {g}
//                     <button onClick={() => removeGenreChip(g)} aria-label={`Remove ${g} filter`}>
//                       <X className="h-3 w-3" />
//                     </button>
//                   </span>
//                 ))
//               )}

//               {appliedYear && (
//                 <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   {appliedYear}
//                   <button onClick={() => updateParam("year", "")} aria-label="Remove year filter">
//                     <X className="h-3 w-3" />
//                   </button>
//                 </span>
//               )}

//               {appliedRating && type !== "song" && (
//                 <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
//                   {appliedRating}+
//                   <button onClick={() => updateParam("rating", "")} aria-label="Remove rating filter">
//                     <X className="h-3 w-3" />
//                   </button>
//                 </span>
//               )}

//               {hasActiveFilters && (
//                 <button
//                   onClick={resetAll}
//                   data-testid="filters-clear-all"
//                   className="text-xs font-semibold text-[#00F0FF] hover:underline"
//                 >
//                   Clear all
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-2 text-sm">
//               <span className="text-neutral-500">Sort by</span>
//               <select
//                 value={sortBy}
//                 onChange={(e) => onSortChange(e.target.value)}
//                 data-testid="browse-sort"
//                 className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
//               >
//                 {SORT_OPTIONS.map((opt) => (
//                   <option key={opt.value} value={opt.value} className="bg-black">
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {loading && page === 1 ? (
//             <div className="py-20 text-center text-neutral-500">Loading…</div>
//           ) : items.length === 0 ? (
//             <div
//               data-testid="browse-empty"
//               className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center"
//             >
//               <p className="font-display text-2xl text-white">No results</p>
//               <p className="mt-2 text-sm text-neutral-500">
//                 Try clearing filters or a different search term.
//               </p>
//             </div>
//           ) : (
//             <>
//               <div
//                 className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 sm:grid-cols-3 md:grid-cols-4"
//                 data-testid="browse-grid"
//               >
//                 {type === "song"
//                   ? items.map((song) => (
//                       <MusicMediaCard key={song.id} item={song} width="w-full" />
//                     ))
//                   : items.map((item) => (
//                       <MediaCard key={item.id} item={item} width="w-full" />
//                     ))}
//               </div>
//               {loadingMore && (
//                 <div className="py-10 text-center text-neutral-500">
//                   Loading more…
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";
import MusicMediaCard from "@/components/MusicMediaCard";
import { Search, X } from "lucide-react";

const TYPES = [
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
  { value: "song", label: "Music" },
];

const MOVIE_SERIES_GENRES = [
  "Drama",
  "Sci-Fi",
  "Thriller",
  "Mystery",
  "Action",
  "Comedy",
  "Romance",
  "Horror",
  "Fantasy",
];

const MUSIC_GENRES = ["Synthwave", "Indie", "Pop", "Jazz", "Folk"];

const GENRES_VISIBLE_COUNT = 5;

const YEARS_VISIBLE = [2026, 2025, 2024, 2023, 2022, 2021];
const YEARS_MORE = [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

const RATINGS_VISIBLE = [
  { value: "", label: "Any" },
  { value: "4.0", label: "4.0+" },
  { value: "3.5", label: "3.5+" },
  { value: "3.0", label: "3.0+" },
];
const RATINGS_MORE = [
  { value: "2.5", label: "2.5+" },
  { value: "2.0", label: "2.0+" },
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "title", label: "Title A-Z" },
];

const chipClass = (active) =>
  `rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition sm:px-4 sm:py-1.5 sm:text-xs ${
    active
      ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]"
      : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
  }`;

// Module scope, not component state — this must persist across every
// mount/unmount of Browse within the same browser session, so the reload
// check below only ever runs once per real document load. If this lived in
// component state instead, it would reset every time Browse unmounts (e.g.
// navigating away and back), and performance.getEntriesByType("navigation")
// stays "reload" for the *entire* tab session after even one hard refresh —
// so without this guard, a single refresh would cause every future
// navigation to Browse (including a legitimate navbar search) to have its
// `q` silently stripped back out.
let hasHandledReloadClear = false;

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ---- Applied filters (drive the actual fetch, live in the URL) ----
  // Read straight from the URL on every render/mount — including on a
  // browser reload — so whatever's already there (e.g. type=movie) stays
  // selected. Filters are only cleared explicitly: switching content type
  // (onSelectType) or clicking Reset all/Clear all.
  const type = params.get("type") || "";
  const q = params.get("q") || "";
  const appliedGenres = (params.get("genres") || "")
    .split(",")
    .filter(Boolean);
  const appliedYear = params.get("year") || "";
  const appliedRating = params.get("rating") || "";
  const sortBy = params.get("sortBy") || "popularity";

  const [searchInput, setSearchInput] = useState(q);

  // Keep the search box in sync when filters are cleared/reset elsewhere
  // (Reset all, type switch, mount reset) so it doesn't show stale text.
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Clear any search term left in the URL on an actual hard refresh — but
  // NOT on a normal SPA navigation here (e.g. the navbar search bar linking
  // to /browse?q=...). Filters (type, genre, year, rating, sort) persist
  // across refresh as before; only a stale search query gets dropped, and
  // only once per real page load (see hasHandledReloadClear above).
  useEffect(() => {
    if (!hasHandledReloadClear) {
      hasHandledReloadClear = true;

      const navEntry = performance.getEntriesByType("navigation")[0];
      const isReload = navEntry?.type === "reload";

      if (isReload && params.get("q")) {
        const next = new URLSearchParams(params);
        next.delete("q");
        setParams(next, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [showAllRatings, setShowAllRatings] = useState(false);
  // Sidebar is collapsed by default on mobile (<lg) and toggled open via
  // the "Filters" button; on lg+ screens it's always visible regardless
  // of this state (see the `lg:block` override on the <aside> below).
  const [showFilters, setShowFilters] = useState(false);

  const activeGenreOptions = type === "song" ? MUSIC_GENRES : MOVIE_SERIES_GENRES;
  const visibleGenreOptions = showAllGenres
    ? activeGenreOptions
    : activeGenreOptions.slice(0, GENRES_VISIBLE_COUNT);
  const visibleYears = showAllYears ? [...YEARS_VISIBLE, ...YEARS_MORE] : YEARS_VISIBLE;
  const visibleRatings = showAllRatings
    ? [...RATINGS_VISIBLE, ...RATINGS_MORE]
    : RATINGS_VISIBLE;

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [type, appliedGenres.join(","), appliedYear, appliedRating, sortBy, q]);

  useEffect(() => {
    let active = true;

    if (page === 1) {
      setLoading(true);
      setItems([]);
    } else {
      setLoadingMore(true);
    }

    api
      .get("/home/queryContent", {
        params: {
          ...(type ? { type } : {}),
          ...(appliedGenres.length ? { genres: appliedGenres.join(",") } : {}),
          ...(appliedYear ? { year: appliedYear } : {}),
          ...(appliedRating ? { rating: appliedRating } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(q ? { q } : {}),
          page,
        },
      })
      .then((r) => {
        if (!active) return;

        // The song endpoint returns { results, page, hasMore }.
        // Movie/series/all endpoints return a bare array.
        const isPaginatedShape =
          r.data && !Array.isArray(r.data) && Array.isArray(r.data.results);

        const newItems = isPaginatedShape ? r.data.results : r.data || [];

        setItems((prev) => {
          if (page === 1) {
            return newItems;
          }
          const combined = [...prev, ...newItems];
          const seen = new Set();
          return combined.filter((it) => {
            const key = `${it.type}-${it.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        });

        if (isPaginatedShape) {
          setHasMore(Boolean(r.data.hasMore));
        } else if (newItems.length === 0) {
          setHasMore(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setHasMore(false);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, appliedGenres.join(","), appliedYear, appliedRating, sortBy, q, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadingMore, hasMore]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const onSearch = (e) => {
    e.preventDefault();
    updateParam("q", searchInput.trim());
  };

  // Content type applies immediately (it changes what the whole page is
  // browsing). Clicking the already-active type deselects it.
  //
  // Switching type — or deselecting it — wipes every other filter
  // (genres, year, rating, sort, search) rather than just pruning
  // genres, since "Top Rated Sci-Fi from 2022" for Movies doesn't carry
  // any sensible meaning once you're looking at Music.
  const onSelectType = (value) => {
    const nextType = value === type ? "" : value;
    const next = new URLSearchParams();

    if (nextType) next.set("type", nextType);

    setSearchInput("");
    setParams(next);
  };

  const onSortChange = (value) => {
    updateParam("sortBy", value);
  };

  // Every filter click writes straight to the URL and applies immediately —
  // no separate "staged" state to fall out of sync with what's actually
  // being fetched.
  const toggleGenre = (g) => {
    const next = new URLSearchParams(params);
    const nextGenres = appliedGenres.includes(g)
      ? appliedGenres.filter((x) => x !== g)
      : [...appliedGenres, g];

    if (nextGenres.length) next.set("genres", nextGenres.join(","));
    else next.delete("genres");

    setParams(next);
  };

  const clearGenres = () => updateParam("genres", "");

  const setYear = (y) => updateParam("year", y);

  const setRating = (r) => updateParam("rating", r);

  const resetAll = () => {
    setSearchInput("");
    setParams(new URLSearchParams());
  };

  const removeGenreChip = (g) => {
    const next = appliedGenres.filter((x) => x !== g);
    const params2 = new URLSearchParams(params);
    if (next.length) params2.set("genres", next.join(","));
    else params2.delete("genres");
    setParams(params2);
  };

  const hasActiveFilters =
    type || appliedGenres.length > 0 || appliedYear || appliedRating || q;

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-10"
      data-testid="browse-page"
    >
      <div className="mb-6 flex flex-col gap-2 sm:mb-8">
        <span className="label-caps text-cyan">Catalog</span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Browse Everything
        </h1>
      </div>

      {/* Search */}
      <form
        onSubmit={onSearch}
        className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 sm:mb-8 sm:gap-3 sm:px-5 sm:py-3"
      >
        <Search className="h-5 w-5 shrink-0 text-neutral-500" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search titles, creators, cast…"
          className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none sm:text-base"
          data-testid="browse-search-input"
        />
        <button
          type="submit"
          data-testid="browse-search-submit"
          className="shrink-0 rounded-full border border-[#00F0FF] px-3 py-1.5 text-xs font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black sm:px-4"
        >
          Search
        </button>
      </form>

      {/* Mobile-only filters toggle */}
      <button
        onClick={() => setShowFilters((v) => !v)}
        data-testid="filters-toggle-mobile"
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white lg:hidden"
      >
        <span>Filters{hasActiveFilters ? " (active)" : ""}</span>
        <span className="text-xs text-[#00F0FF]">
          {showFilters ? "Hide" : "Show"}
        </span>
      </button>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* ---------------- Sidebar ---------------- */}
        <aside
          className={`w-full shrink-0 lg:block lg:w-72 ${
            showFilters ? "block" : "hidden"
          }`}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <h2 className="font-display text-base font-semibold text-white sm:text-lg">
                Filters
              </h2>
              <button
                onClick={resetAll}
                data-testid="filters-reset-all"
                className="text-[11px] font-semibold text-[#00F0FF] hover:underline sm:text-xs"
              >
                Reset all
              </button>
            </div>

            {/* Content Type */}
            <div className="mb-4 sm:mb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:mb-3 sm:text-xs">
                Content Type
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onSelectType(t.value)}
                    data-testid={`filter-type-${t.value}`}
                    className={chipClass(type === t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genres (multi-select, applies instantly) */}
            <div className="mb-4 sm:mb-6">
              <div className="mb-2 flex items-center justify-between sm:mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:text-xs">
                  Genres
                </p>
                <button
                  onClick={() => setShowAllGenres((v) => !v)}
                  className="text-[11px] font-semibold text-[#00F0FF] hover:underline sm:text-xs"
                >
                  {showAllGenres ? "Show less" : "See all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={clearGenres}
                  data-testid="filter-genre-all"
                  className={chipClass(appliedGenres.length === 0)}
                >
                  All Genres
                </button>
                {visibleGenreOptions.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    data-testid={`filter-genre-${g}`}
                    className={chipClass(appliedGenres.includes(g))}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Year (single-select, applies instantly) */}
            <div className="mb-4 sm:mb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:mb-3 sm:text-xs">
                Year
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setYear("")}
                  data-testid="filter-year-any"
                  className={chipClass(appliedYear === "")}
                >
                  Any
                </button>
                {visibleYears.map((y) => (
                  <button
                    key={y}
                    onClick={() => setYear(String(y))}
                    data-testid={`filter-year-${y}`}
                    className={chipClass(appliedYear === String(y))}
                  >
                    {y}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAllYears((v) => !v)}
                className="mt-2 text-[11px] font-semibold text-neutral-400 hover:text-white sm:text-xs"
              >
                {showAllYears ? "− Less" : "+ More"}
              </button>
            </div>

            {/* Rating (single-select, applies instantly) — hidden for
                Music, since the rating filter doesn't apply to songs. */}
            {type !== "song" && (
              <div className="mb-4 sm:mb-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 sm:mb-3 sm:text-xs">
                  Rating
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {visibleRatings.map((r) => (
                    <button
                      key={r.value || "any"}
                      onClick={() => setRating(r.value)}
                      data-testid={`filter-rating-${r.value || "any"}`}
                      className={chipClass(appliedRating === r.value)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowAllRatings((v) => !v)}
                  className="mt-2 text-[11px] font-semibold text-neutral-400 hover:text-white sm:text-xs"
                >
                  {showAllRatings ? "− Less" : "+ More"}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ---------------- Results ---------------- */}
        <div className="min-w-0 flex-1">
          {/* Applied filter chips + sort */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {type && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                  {TYPES.find((t) => t.value === type)?.label}
                  <button onClick={() => onSelectType(type)} aria-label="Remove type filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {appliedGenres.length === 0 ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                  All Genres
                </span>
              ) : (
                appliedGenres.map((g) => (
                  <span
                    key={g}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300"
                  >
                    {g}
                    <button onClick={() => removeGenreChip(g)} aria-label={`Remove ${g} filter`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}

              {appliedYear && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                  {appliedYear}
                  <button onClick={() => updateParam("year", "")} aria-label="Remove year filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {appliedRating && type !== "song" && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
                  {appliedRating}+
                  <button onClick={() => updateParam("rating", "")} aria-label="Remove rating filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {hasActiveFilters && (
                <button
                  onClick={resetAll}
                  data-testid="filters-clear-all"
                  className="text-xs font-semibold text-[#00F0FF] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-500">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                data-testid="browse-sort"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-black">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && page === 1 ? (
            <div className="py-20 text-center text-neutral-500">Loading…</div>
          ) : items.length === 0 ? (
            <div
              data-testid="browse-empty"
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center"
            >
              <p className="font-display text-2xl text-white">No results</p>
              <p className="mt-2 text-sm text-neutral-500">
                Try clearing filters or a different search term.
              </p>
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 sm:grid-cols-3 md:grid-cols-4"
                data-testid="browse-grid"
              >
                {type === "song"
                  ? items.map((song) => (
                      <MusicMediaCard key={song.id} item={song} width="w-full" />
                    ))
                  : items.map((item) => (
                      <MediaCard key={item.id} item={item} width="w-full" />
                    ))}
              </div>
              {loadingMore && (
                <div className="py-10 text-center text-neutral-500">
                  Loading more…
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}