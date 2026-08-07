// components/SpotifyRecommendations.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Music2 } from "lucide-react";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";

// ── Skeleton shimmer card ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="min-w-[160px] w-40 shrink-0 animate-pulse rounded-xl bg-white/5">
      <div className="aspect-[2/3] rounded-xl bg-white/10" />
      <div className="mt-2 mx-1 h-3 rounded bg-white/10" />
      <div className="mt-1 mx-1 h-3 w-2/3 rounded bg-white/10" />
    </div>
  );
}

// ── Horizontal scroll row ─────────────────────────────────────────────────────
function SpotifyRow({ title, items, badge, loading }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir * scrollRef.current.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Spotify green badge */}
          <span className="flex items-center gap-1.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 px-3 py-1 text-xs font-semibold text-[#1DB954]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#1DB954]">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Spotify
          </span>
          <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <MediaCard key={`${item.type}-${item.id}`} item={item} />
            ))}
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SpotifyRecommendations({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const spotifyConnected = user?.spotify?.connected;

  useEffect(() => {
    if (!spotifyConnected) {
      setLoading(false);
      return;
    }

    api
      .get("/spotify/personalized")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.warn("Spotify recs not available:", err.message);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [spotifyConnected]);

  // Hide completely if not connected or errored after trying
  if (!spotifyConnected || error) return null;

  const moodLabel = data?.label || "…";
  const movies = data?.movies || [];
  const music = data?.music || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Movies row */}
        <SpotifyRow
          title={loading ? "Loading your taste…" : `Because you love ${moodLabel} music`}
          items={movies}
          loading={loading}
        />

        {/* Music row */}
        <SpotifyRow
          title={loading ? "Finding your vibe…" : `More ${moodLabel} songs for you`}
          items={music}
          loading={loading}
        />
      </motion.div>
    </AnimatePresence>
  );
}
