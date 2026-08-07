// import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import api from "@/lib/api";
// import MediaCard from "@/components/MediaCard";
// import { StarRating } from "@/components/StarRating";
// import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";

// function Row({ title, items: initialItems = [], section, testid, ranked = false }) {
//   const scrollRef = useRef(null);

//   const [items, setItems] = useState(initialItems);
//   const [page, setPage] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);
//   // Ranked (Top 10 Trending) row is a fixed-length list — never paginates.
//   const [hasMore, setHasMore] = useState(!ranked);

//   // Reset whenever homepage data changes
//   useEffect(() => {
//     setItems(initialItems);
//     setPage(1);
//     setHasMore(!ranked);
//   }, [initialItems]);

//   const loadNextPage = async () => {
//     if (ranked || loadingMore || !hasMore) return;

//     setLoadingMore(true);

//     try {
//       const nextPage = page + 1;

//       const res = await api.get("/home/section", {
//         params: {
//           section,
//           page: nextPage,
//         },
//       });

//       const newItems = res.data || [];

//       if (newItems.length === 0) {
//         setHasMore(false);
//       } else {
//         setItems((prev) => {
//           const combined = [...prev, ...newItems];

//           const seen = new Set();

//           return combined.filter((item) => {
//             const key = `${item.type}-${item.id}`;

//             if (seen.has(key)) return false;

//             seen.add(key);

//             return true;
//           });
//         });

//         setPage(nextPage);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   const handleScroll = () => {
//     if (ranked) return;

//     const el = scrollRef.current;

//     if (!el) return;

//     const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;

//     if (remaining < 400) {
//       loadNextPage();
//     }
//   };

//   if (!items.length) return null;

//   return (
//     <section className="mb-14" data-testid={testid}>
//       <div className="mb-5 flex items-center justify-between">
//         <h2 className="font-display text-2xl font-semibold text-white">
//           {title}
//         </h2>

//         <div className="flex gap-2">
//           <button
//             onClick={() =>
//               scrollRef.current?.scrollBy({
//                 left: -scrollRef.current.clientWidth * 0.8,
//                 behavior: "smooth",
//               })
//             }
//             className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
//           >
//             <ChevronLeft className="h-5 w-5" />
//           </button>

//           <button
//             onClick={() =>
//               scrollRef.current?.scrollBy({
//                 left: scrollRef.current.clientWidth * 0.8,
//                 behavior: "smooth",
//               })
//             }
//             className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
//           >
//             <ChevronRight className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       <div
//         ref={scrollRef}
//         onScroll={handleScroll}
//         className="no-scrollbar overflow-x-auto scroll-smooth flex gap-4"
//       >
//         {items.map((item, index) =>
//           ranked ? (
//             <div
//               key={`${item.type}-${item.id}`}
//               className="relative flex shrink-0 items-end"
//             >
//               {/* Outlined rank number, sits behind/left of the card like the reference image */}
//               <span
//                 className="select-none font-display font-black leading-none text-transparent"
//                 style={{
//                   fontSize: "84px",
//                   WebkitTextStroke: "2px rgba(255,255,255,0.35)",
//                   marginRight: "-28px",
//                   marginBottom: "-6px",
//                   zIndex: 0,
//                 }}
//               >
//                 {index + 1}
//               </span>
//               <div className="relative z-10">
//                 <MediaCard item={item} />
//               </div>
//             </div>
//           ) : (
//             <MediaCard key={`${item.type}-${item.id}`} item={item} />
//           )
//         )}

//         {loadingMore && (
//           <div className="flex min-w-[180px] items-center justify-center text-neutral-500">
//             Loading...
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// export default function Home() {
//   const [home, setHome] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [exploreItems, setExploreItems] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   useEffect(() => {
//     api
//       .get("/home")
//       .then((res) => {
//         console.log(res.data);
//         setHome(res.data);
//       })
//       .catch((err) => {
//         console.error(err);
//       })
//       .finally(() => setLoading(false));
//   }, []);

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

//   useEffect(() => {
//     if (page === 1) return;

//     setLoadingMore(true);
//     api
//       .get("/home", { params: { page } })
//       .then((res) => {
//         const newItems = res.data || [];
//         if (newItems.length === 0) {
//           setHasMore(false);
//         } else {
//           setExploreItems((prev) => {
//             const combined = [...prev, ...newItems];
//             const seen = new Set();
//             return combined.filter((it) => {
//               const key = `${it.type}-${it.id}`;
//               if (seen.has(key)) return false;
//               seen.add(key);
//               return true;
//             });
//           });
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//       })
//       .finally(() => setLoadingMore(false));
//   }, [page]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center text-neutral-400">
//         Loading catalog...
//       </div>
//     );
//   }

//   if (!home) {
//     return (
//       <div className="flex min-h-screen items-center justify-center text-neutral-400">
//         Failed to load homepage.
//       </div>
//     );
//   }

//   const featured = home.trending?.[0];

//   // Top 10 Trending: highest-rated, trending items — capped at exactly 10,
//   // sorted by rating so #1 is genuinely the best on the site.
//   const topTrending = [...(home.trending || [])]
//     .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
//     .slice(0, 10);

//   return (
//     <div className="pb-20">
//       {featured && (
//         <section className="relative mb-14 h-[72vh] min-h-[600px] overflow-hidden">
//           <img
//             src={featured.backdrop_url || featured.cover_url}
//             alt={featured.title}
//             className="absolute inset-0 h-full w-full object-cover"
//           />

//           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

//           <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />

//           <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10">
//             <motion.div
//               initial={{ opacity: 0, y: 25 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.7 }}
//               className="max-w-2xl"
//             >
//               <div className="mb-4 flex items-center gap-3">
//                 <span className="label-caps text-cyan" data-testid="hero-badge">
//                   Featured • {featured.type}
//                 </span>

//                 <span className="h-[1px] w-16 bg-gradient-to-r from-[#00F0FF] to-transparent" />
//               </div>

//               <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
//                 {featured.title}
//               </h1>

//               <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
//                 <StarRating value={featured.avg_rating || 0} />

//                 <span>{featured.release_year}</span>

//                 <span>•</span>

//                 <span>{featured.genres?.join(" / ")}</span>
//               </div>

//               <p className="mt-6 max-w-xl text-neutral-300">
//                 {featured.description}
//               </p>

//               <div className="mt-8 flex flex-wrap gap-3">
//                 <Link
//                   to={`/content/${featured.type}/${featured.id}`}
//                   className="flex items-center gap-2 rounded-full bg-[#00F0FF] px-6 py-3 font-semibold text-black hover:brightness-110"
//                   data-testid="hero-play-btn"
//                 >
//                   <Play className="h-4 w-4 fill-black" />
//                   Explore
//                 </Link>

//                 <Link
//                   to={`/content/${featured.type}/${featured.id}`}
//                   className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-white backdrop-blur hover:bg-white/10"
//                   data-testid="hero-add-btn"
//                 >
//                   <Plus className="h-4 w-4" />
//                   More Info
//                 </Link>
//               </div>
//             </motion.div>
//           </div>
//         </section>
//       )}

//       <div className="mx-auto max-w-7xl px-6 md:px-10">
//         <Row
//           title="Top 10 Trending"
//           items={topTrending}
//           testid="row-trending"
//           ranked
//         />
//         {home.recommended?.length > 0 && (
//           <Row
//             title="Recommended For You"
//             section="recommended"
//             items={home.recommended}
//             testid="row-recommended"
//           />
//         )}

//         {home.becauseYouWatched?.items?.length > 0 && (
//           <Row
//             title={`Because You Watched ${home.becauseYouWatched.source.title}`}
//             section={`becauseYouWatched:${home.becauseYouWatched.source.id}`}
//             items={home.becauseYouWatched.items}
//             testid="row-because-you-watched"
//           />
//         )}
//         {home.continueWatching?.length > 0 && (
//           <Row
//             title="Continue Watching"
//             section="continueWatching"
//             items={home.continueWatching}
//             testid="row-continue-watching"
//           />
//         )}

//         <Row
//           title="Upcoming"
//           section="upcoming"
//           items={home.upcoming}
//           testid="row-upcoming"
//         />

//         {home.genreRows?.Action?.length > 0 && (
//           <Row
//             title="Action"
//             section="action"
//             items={home.genreRows.Action}
//             testid="row-action"
//           />
//         )}

//         {home.genreRows?.Comedy?.length > 0 && (
//           <Row
//             title="Comedy"
//             section="comedy"
//             items={home.genreRows.Comedy}
//             testid="row-comedy"
//           />
//         )}

//         {home.genreRows?.Drama?.length > 0 && (
//           <Row
//             title="Drama"
//             section="drama"
//             items={home.genreRows.Drama}
//             testid="row-drama"
//           />
//         )}

//         {home.genreRows?.["Science Fiction"]?.length > 0 && (
//           <Row
//             title="Science Fiction"
//             section="science-fiction"
//             items={home.genreRows["Science Fiction"]}
//             testid="row-scifi"
//           />
//         )}

//         {home.genreRows?.Horror?.length > 0 && (
//           <Row
//             title="Horror"
//             section="horror"
//             items={home.genreRows.Horror}
//             testid="row-horror"
//           />
//         )}

//         {home.genreRows?.Romance?.length > 0 && (
//           <Row
//             title="Romance"
//             section="romance"
//             items={home.genreRows.Romance}
//             testid="row-romance"
//           />
//         )}

//         <Row
//           title="TV Shows"
//           section="tv"
//           items={home.tvShows}
//           testid="row-tv-shows"
//         />
//         {exploreItems.length > 0 && (
//           <section className="mb-14" data-testid="explore-grid-section">
//             <h2 className="font-display text-2xl font-semibold text-white mb-6">
//               More to Explore
//             </h2>
//             <div
//               className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
//               data-testid="explore-grid"
//             >
//               {exploreItems.map((it) => (
//                 <MediaCard
//                   key={`${it.type}-${it.id}`}
//                   item={it}
//                   width="w-full"
//                 />
//               ))}
//             </div>
//           </section>
//         )}

//         {loadingMore && (
//           <div className="py-10 text-center text-neutral-400">
//             Loading more...
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import api from "@/lib/api";
// import MediaCard from "@/components/MediaCard";
// import { StarRating } from "@/components/StarRating";
// import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";

// function Row({ title, items: initialItems = [], section, testid, ranked = false }) {
//   const scrollRef = useRef(null);

//   const [items, setItems] = useState(initialItems);
//   const [page, setPage] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);
//   // Ranked (Top 10 Trending) row is a fixed-length list — never paginates.
//   const [hasMore, setHasMore] = useState(!ranked);

//   // Reset whenever homepage data changes
//   useEffect(() => {
//     setItems(initialItems);
//     setPage(1);
//     setHasMore(!ranked);
//   }, [initialItems]);

//   const loadNextPage = async () => {
//     if (ranked || loadingMore || !hasMore) return;

//     setLoadingMore(true);

//     try {
//       const nextPage = page + 1;

//       const res = await api.get("/home/section", {
//         params: {
//           section,
//           page: nextPage,
//         },
//       });

//       const newItems = res.data || [];

//       if (newItems.length === 0) {
//         setHasMore(false);
//       } else {
//         setItems((prev) => {
//           const combined = [...prev, ...newItems];

//           const seen = new Set();

//           return combined.filter((item) => {
//             const key = `${item.type}-${item.id}`;

//             if (seen.has(key)) return false;

//             seen.add(key);

//             return true;
//           });
//         });

//         setPage(nextPage);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   const handleScroll = () => {
//     if (ranked) return;

//     const el = scrollRef.current;

//     if (!el) return;

//     const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;

//     if (remaining < 400) {
//       loadNextPage();
//     }
//   };

//   if (!items.length) return null;

//   return (
//     <section className="mb-14" data-testid={testid}>
//       <div className="mb-5 flex items-center justify-between">
//         <h2 className="font-display text-2xl font-semibold text-white">
//           {title}
//         </h2>

//         <div className="flex gap-2">
//           <button
//             onClick={() =>
//               scrollRef.current?.scrollBy({
//                 left: -scrollRef.current.clientWidth * 0.8,
//                 behavior: "smooth",
//               })
//             }
//             className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
//           >
//             <ChevronLeft className="h-5 w-5" />
//           </button>

//           <button
//             onClick={() =>
//               scrollRef.current?.scrollBy({
//                 left: scrollRef.current.clientWidth * 0.8,
//                 behavior: "smooth",
//               })
//             }
//             className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
//           >
//             <ChevronRight className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       <div
//   ref={scrollRef}
//   onScroll={handleScroll}
//   className={`no-scrollbar overflow-x-auto scroll-smooth flex items-end pt-16 ${
//     ranked ? "gap-2" : "gap-4"
//   }`}
// >
//         {items.map((item, index) =>
//   ranked ? (
//     <div
//       key={`${item.type}-${item.id}`}
//       className="relative flex flex-shrink-0 items-end"
//     >
//       <span
//         className="relative z-0 select-none font-display font-black leading-none text-neutral-700 pointer-events-none"
//         style={{
//           fontSize: "180px",
//           lineHeight: "0.75",
//           marginRight: "-36px",
//           marginBottom: "18px", // lifts the number so its base lines up above the title text, not through it
//         }}
//       >
//         {index + 1}
//       </span>

//       <div className="relative z-10">
//         <MediaCard item={item} />
//       </div>
//     </div>
//   ) : (
//     <MediaCard key={`${item.type}-${item.id}`} item={item} />
//   )
// )}

//         {loadingMore && (
//           <div className="flex min-w-[180px] items-center justify-center text-neutral-500">
//             Loading...
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// export default function Home() {
//   const [home, setHome] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [exploreItems, setExploreItems] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   useEffect(() => {
//     api
//       .get("/home")
//       .then((res) => {
//         console.log(res.data);
//         setHome(res.data);
//       })
//       .catch((err) => {
//         console.error(err);
//       })
//       .finally(() => setLoading(false));
//   }, []);

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

//   useEffect(() => {
//     if (page === 1) return;

//     setLoadingMore(true);
//     api
//       .get("/home", { params: { page } })
//       .then((res) => {
//         const newItems = res.data || [];
//         if (newItems.length === 0) {
//           setHasMore(false);
//         } else {
//           setExploreItems((prev) => {
//             const combined = [...prev, ...newItems];
//             const seen = new Set();
//             return combined.filter((it) => {
//               const key = `${it.type}-${it.id}`;
//               if (seen.has(key)) return false;
//               seen.add(key);
//               return true;
//             });
//           });
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//       })
//       .finally(() => setLoadingMore(false));
//   }, [page]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center text-neutral-400">
//         Loading catalog...
//       </div>
//     );
//   }

//   if (!home) {
//     return (
//       <div className="flex min-h-screen items-center justify-center text-neutral-400">
//         Failed to load homepage.
//       </div>
//     );
//   }

//   const featured = home.trending?.[0];

//   // Top 10 Trending: highest-rated, trending items — capped at exactly 10,
//   // sorted by rating so #1 is genuinely the best on the site.
//   const topTrending = [...(home.trending || [])]
//     .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
//     .slice(0, 10);

//   return (
//     <div className="pb-20">
//       {featured && (
//         <section className="relative mb-14 h-[72vh] min-h-[600px] overflow-hidden">
//           <img
//             src={featured.backdrop_url || featured.cover_url}
//             alt={featured.title}
//             className="absolute inset-0 h-full w-full object-cover"
//           />

//           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

//           <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />

//           <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10">
//             <motion.div
//               initial={{ opacity: 0, y: 25 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.7 }}
//               className="max-w-2xl"
//             >
//               <div className="mb-4 flex items-center gap-3">
//                 <span className="label-caps text-cyan" data-testid="hero-badge">
//                   Featured • {featured.type}
//                 </span>

//                 <span className="h-[1px] w-16 bg-gradient-to-r from-[#00F0FF] to-transparent" />
//               </div>

//               <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
//                 {featured.title}
//               </h1>

//               <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
//                 <StarRating value={featured.avg_rating || 0} />

//                 <span>{featured.release_year}</span>

//                 <span>•</span>

//                 <span>{featured.genres?.join(" / ")}</span>
//               </div>

//               <p className="mt-6 max-w-xl text-neutral-300">
//                 {featured.description}
//               </p>

//               <div className="mt-8 flex flex-wrap gap-3">
//                 <Link
//                   to={`/content/${featured.type}/${featured.id}`}
//                   className="flex items-center gap-2 rounded-full bg-[#00F0FF] px-6 py-3 font-semibold text-black hover:brightness-110"
//                   data-testid="hero-play-btn"
//                 >
//                   <Play className="h-4 w-4 fill-black" />
//                   Explore
//                 </Link>

//                 <Link
//                   to={`/content/${featured.type}/${featured.id}`}
//                   className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-white backdrop-blur hover:bg-white/10"
//                   data-testid="hero-add-btn"
//                 >
//                   <Plus className="h-4 w-4" />
//                   More Info
//                 </Link>
//               </div>
//             </motion.div>
//           </div>
//         </section>
//       )}

//       <div className="mx-auto max-w-7xl px-6 md:px-10">
//         <Row
//           title="Top 10 Trending"
//           items={topTrending}
//           testid="row-trending"
//           ranked
//         />
//         {home.recommended?.length > 0 && (
//           <Row
//             title="Recommended For You"
//             section="recommended"
//             items={home.recommended}
//             testid="row-recommended"
//           />
//         )}

//         {home.becauseYouWatched?.items?.length > 0 && (
//           <Row
//             title={`Because You Watched ${home.becauseYouWatched.source.title}`}
//             section={`becauseYouWatched:${home.becauseYouWatched.source.id}`}
//             items={home.becauseYouWatched.items}
//             testid="row-because-you-watched"
//           />
//         )}
//         {home.continueWatching?.length > 0 && (
//           <Row
//             title="Continue Watching"
//             section="continueWatching"
//             items={home.continueWatching}
//             testid="row-continue-watching"
//           />
//         )}

//         <Row
//           title="Upcoming"
//           section="upcoming"
//           items={home.upcoming}
//           testid="row-upcoming"
//         />

//         {home.genreRows?.Action?.length > 0 && (
//           <Row
//             title="Action"
//             section="action"
//             items={home.genreRows.Action}
//             testid="row-action"
//           />
//         )}

//         {home.genreRows?.Comedy?.length > 0 && (
//           <Row
//             title="Comedy"
//             section="comedy"
//             items={home.genreRows.Comedy}
//             testid="row-comedy"
//           />
//         )}

//         {home.genreRows?.Drama?.length > 0 && (
//           <Row
//             title="Drama"
//             section="drama"
//             items={home.genreRows.Drama}
//             testid="row-drama"
//           />
//         )}

//         {home.genreRows?.["Science Fiction"]?.length > 0 && (
//           <Row
//             title="Science Fiction"
//             section="science-fiction"
//             items={home.genreRows["Science Fiction"]}
//             testid="row-scifi"
//           />
//         )}

//         {home.genreRows?.Horror?.length > 0 && (
//           <Row
//             title="Horror"
//             section="horror"
//             items={home.genreRows.Horror}
//             testid="row-horror"
//           />
//         )}

//         {home.genreRows?.Romance?.length > 0 && (
//           <Row
//             title="Romance"
//             section="romance"
//             items={home.genreRows.Romance}
//             testid="row-romance"
//           />
//         )}

//         <Row
//           title="TV Shows"
//           section="tv"
//           items={home.tvShows}
//           testid="row-tv-shows"
//         />
//         {exploreItems.length > 0 && (
//           <section className="mb-14" data-testid="explore-grid-section">
//             <h2 className="font-display text-2xl font-semibold text-white mb-6">
//               More to Explore
//             </h2>
//             <div
//               className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
//               data-testid="explore-grid"
//             >
//               {exploreItems.map((it) => (
//                 <MediaCard
//                   key={`${it.type}-${it.id}`}
//                   item={it}
//                   width="w-full"
//                 />
//               ))}
//             </div>
//           </section>
//         )}

//         {loadingMore && (
//           <div className="py-10 text-center text-neutral-400">
//             Loading more...
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";
import { StarRating } from "@/components/StarRating";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";

function Row({ title, items: initialItems = [], section, testid, ranked = false }) {
  const scrollRef = useRef(null);

  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  // Ranked (Top 10 Trending) row is a fixed-length list — never paginates.
  const [hasMore, setHasMore] = useState(!ranked);

  // Reset whenever homepage data changes
  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(!ranked);
  }, [initialItems]);

  const loadNextPage = async () => {
    if (ranked || loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const nextPage = page + 1;

      const res = await api.get("/home/section", {
        params: {
          section,
          page: nextPage,
        },
      });

      const newItems = res.data || [];

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const combined = [...prev, ...newItems];

          const seen = new Set();

          return combined.filter((item) => {
            const key = `${item.type}-${item.id}`;

            if (seen.has(key)) return false;

            seen.add(key);

            return true;
          });
        });

        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (ranked) return;

    const el = scrollRef.current;

    if (!el) return;

    const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;

    if (remaining < 400) {
      loadNextPage();
    }
  };

  if (!items.length) return null;

  return (
    <section className="mb-14" data-testid={testid}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-white">
          {title}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({
                left: -scrollRef.current.clientWidth * 0.8,
                behavior: "smooth",
              })
            }
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() =>
              scrollRef.current?.scrollBy({
                left: scrollRef.current.clientWidth * 0.8,
                behavior: "smooth",
              })
            }
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        Updated
        upstream
        onScroll={handleScroll}
        className={`no-scrollbar touch-pan-x overflow-x-auto scroll-smooth flex ${
          ranked ? "gap-10 items-center pl-8" : "gap-4 items-start"
        }`}
      >
        {items.map((item, index) =>
          ranked ? (
            <div
              key={`${item.type}-${item.id}`}
               className="relative flex flex-shrink-0 self-start"
            >
              {/* Flat, solid rank number — vertically centered on the poster,
                  sitting mostly in the gutter with only a slight overlap onto
                  the card's edge (never over the title/genre text below). */}
              <span
                className="relative z-0 -mr-4 select-none font-black leading-none pointer-events-none"
                style={{
  fontFamily: "Bebas Neue",
  fontSize: "170px",

  background: `
linear-gradient(
  180deg,
  rgba(255,255,255,1) 0%,
  rgba(255,255,255,1) 8%,
  rgba(255,255,255,0.85) 15%,
  rgba(255,255,255,0.55) 25%,
  rgba(255,255,255,0.25) 40%,
  rgba(255,255,255,0.08) 60%,
  rgba(255,255,255,0.02) 75%,
  rgba(255,255,255,0) 100%
)
`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
}}
              >
                {index + 1}
              </span>


              {/* <span
  className="absolute select-none pointer-events-none z-0"
  style={{
    left: "20px",          // move closer to the card
    top: "-5px",

    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: "215px",
    fontWeight: 700,
    lineHeight: "0.8",
    letterSpacing: "-6px",

    background: `
linear-gradient(
180deg,
#ffffff 0%,
#f8f8f8 25%,
#d8d8d8 55%,
#8d8d8d 78%,
rgba(40,40,40,.95) 100%
)
`,

    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    opacity: 0.95,

    WebkitTextStroke: "1px rgba(255,255,255,.18)",

    filter: `
      drop-shadow(0 3px 6px rgba(0,0,0,.45))
      drop-shadow(0 14px 22px rgba(0,0,0,.35))
    `,
  }}
>
  {index + 1}
</span> */}

              <div
  className="relative z-10"
  style={{
    marginLeft: "-6px",
  }}
>
    <MediaCard item={item} />
</div>
            </div>
          ) : (
            <MediaCard key={`${item.type}-${item.id}`} item={item} />
          )
        )}

        {loadingMore && (
          <div className="flex min-w-[180px] items-center justify-center text-neutral-500">
            Loading...
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exploreItems, setExploreItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    api
      .get("/home")
      .then((res) => {
        console.log(res.data);
        setHome(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

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

  useEffect(() => {
    if (page === 1) return;

    setLoadingMore(true);
    api
      .get("/home", { params: { page } })
      .then((res) => {
        const newItems = res.data || [];
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setExploreItems((prev) => {
            const combined = [...prev, ...newItems];
            const seen = new Set();
            return combined.filter((it) => {
              const key = `${it.type}-${it.id}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoadingMore(false));
  }, [page]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-400">
        Loading catalog...
      </div>
    );
  }

  if (!home) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-400">
        Failed to load homepage.
      </div>
    );
  }

  const featured = home.trending?.[0];

  // Top 10 Trending: highest-rated, trending items — capped at exactly 10,
  // sorted by rating so #1 is genuinely the best on the site.
  const topTrending = [...(home.trending || [])]
    .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    .slice(0, 10);

  return (
    <div className="pb-20">
      {featured && (
        <section className="relative mb-14 h-[72vh] min-h-[600px] overflow-hidden">
          <img
            src={featured.backdrop_url || featured.cover_url}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />

          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="label-caps text-cyan" data-testid="hero-badge">
                  Featured • {featured.type}
                </span>

                <span className="h-[1px] w-16 bg-gradient-to-r from-[#00F0FF] to-transparent" />
              </div>

              <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {featured.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
                <StarRating value={featured.avg_rating || 0} />

                <span>{featured.release_year}</span>

                <span>•</span>

                <span>{featured.genres?.join(" / ")}</span>
              </div>

              <p className="mt-6 max-w-xl text-neutral-300">
                {featured.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={`/content/${featured.type}/${featured.id}`}
                  className="flex items-center gap-2 rounded-full bg-[#00F0FF] px-6 py-3 font-semibold text-black hover:brightness-110"
                  data-testid="hero-play-btn"
                >
                  <Play className="h-4 w-4 fill-black" />
                  Explore
                </Link>

                <Link
                  to={`/content/${featured.type}/${featured.id}`}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-white backdrop-blur hover:bg-white/10"
                  data-testid="hero-add-btn"
                >
                  <Plus className="h-4 w-4" />
                  More Info
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Row
          title="Top 10 Trending"
          items={topTrending}
          testid="row-trending"
          ranked
        />
        {home.recommended?.length > 0 && (
          <Row
            title="Recommended For You"
            section="recommended"
            items={home.recommended}
            testid="row-recommended"
          />
        )}

        {home.becauseYouWatched?.items?.length > 0 && (
          <Row
            title={`Because You Watched ${home.becauseYouWatched.source.title}`}
            section={`becauseYouWatched:${home.becauseYouWatched.source.id}`}
            items={home.becauseYouWatched.items}
            testid="row-because-you-watched"
          />
        )}
        {home.continueWatching?.length > 0 && (
          <Row
            title="Continue Watching"
            section="continueWatching"
            items={home.continueWatching}
            testid="row-continue-watching"
          />
        )}

        <Row
          title="Upcoming"
          section="upcoming"
          items={home.upcoming}
          testid="row-upcoming"
        />

        {home.genreRows?.Action?.length > 0 && (
          <Row
            title="Action"
            section="action"
            items={home.genreRows.Action}
            testid="row-action"
          />
        )}

        {home.genreRows?.Comedy?.length > 0 && (
          <Row
            title="Comedy"
            section="comedy"
            items={home.genreRows.Comedy}
            testid="row-comedy"
          />
        )}

        {home.genreRows?.Drama?.length > 0 && (
          <Row
            title="Drama"
            section="drama"
            items={home.genreRows.Drama}
            testid="row-drama"
          />
        )}

        {home.genreRows?.["Science Fiction"]?.length > 0 && (
          <Row
            title="Science Fiction"
            section="science-fiction"
            items={home.genreRows["Science Fiction"]}
            testid="row-scifi"
          />
        )}

        {home.genreRows?.Horror?.length > 0 && (
          <Row
            title="Horror"
            section="horror"
            items={home.genreRows.Horror}
            testid="row-horror"
          />
        )}

        {home.genreRows?.Romance?.length > 0 && (
          <Row
            title="Romance"
            section="romance"
            items={home.genreRows.Romance}
            testid="row-romance"
          />
        )}

        <Row
          title="TV Shows"
          section="tv"
          items={home.tvShows}
          testid="row-tv-shows"
        />
        {exploreItems.length > 0 && (
          <section className="mb-14" data-testid="explore-grid-section">
            <h2 className="font-display text-2xl font-semibold text-white mb-6">
              More to Explore
            </h2>
            <div
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              data-testid="explore-grid"
            >
              {exploreItems.map((it) => (
                <MediaCard
                  key={`${it.type}-${it.id}`}
                  item={it}
                  width="w-full"
                />
              ))}
            </div>
          </section>
        )}

        {loadingMore && (
          <div className="py-10 text-center text-neutral-400">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
}