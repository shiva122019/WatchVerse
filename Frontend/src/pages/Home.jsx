import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";
import { StarRating } from "@/components/StarRating";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";

function Row({ title, items, testid }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir * scrollRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };
  return (
    <section className="relative mt-14" data-testid={testid}>
      <div className="mb-4 flex items-baseline justify-between px-6 md:px-10">
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scroll(-1)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
            aria-label="Scroll left"
            data-testid={`${testid}-scroll-left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
            aria-label="Scroll right"
            data-testid={`${testid}-scroll-right`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-6 pb-2 md:px-10"
      >
        {items.map((it) => (
          <MediaCard key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/content", { params: { limit: 60 } })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, []);

  const featured = items[0];
  const movies = useMemo(() => items.filter((i) => i.type === "movie"), [items]);
  const series = useMemo(() => items.filter((i) => i.type === "series"), [items]);
  const songs = useMemo(() => items.filter((i) => i.type === "song"), [items]);
  const trending = useMemo(
    () => [...items].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 10),
    [items],
  );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-neutral-500">
        Loading catalog…
      </div>
    );
  }

  return (
    <div className="pb-20" data-testid="home-page">
      {/* Hero */}
      {featured && (
        <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={featured.backdrop_url || featured.cover_url}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 hero-fade" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 hero-fade-bottom" />

          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="label-caps text-cyan"
                  data-testid="hero-badge"
                >
                  Featured · {featured.type}
                </span>
                <span className="h-[1px] w-16 bg-gradient-to-r from-[#00F0FF] to-transparent" />
              </div>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {featured.title}
              </h1>
              <div className="mt-4 flex items-center gap-3 text-sm text-neutral-300">
                <StarRating value={featured.avg_rating || 4} />
                <span className="font-mono-alt text-neutral-400">
                  {featured.release_year}
                </span>
                <span className="text-neutral-700">·</span>
                <span>{featured.genres?.join(" / ")}</span>
              </div>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-300">
                {featured.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={`/content/${featured.id}`}
                  data-testid="hero-play-btn"
                  className="flex items-center gap-2 rounded-full bg-[#00F0FF] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 cyan-glow"
                >
                  <Play className="h-4 w-4 fill-black" /> Explore
                </Link>
                <Link
                  to={`/content/${featured.id}`}
                  data-testid="hero-add-btn"
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" /> More Info
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Row title="Trending Now" items={trending} testid="row-trending" />
      <Row title="Feature Films" items={movies} testid="row-movies" />
      <Row title="Binge-Worthy Series" items={series} testid="row-series" />
      <Row title="Sonic Discoveries" items={songs} testid="row-songs" />
    </div>
  );
}
