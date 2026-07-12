import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";
import { StarRating } from "@/components/StarRating";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";

function Row({ title, items = [], testid }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir * scrollRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-white">
          {title}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
            aria-label="Scroll left"
            data-testid={`${testid}-scroll-left`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => scroll(1)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 hover:text-white"
            aria-label="Scroll right"
            data-testid={`${testid}-scroll-right`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide"
      >
        {items.map((it) => (
          <MediaCard key={`${it.type}-${it.id}`} item={it} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const featured = home.featured;

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
        <Row title="Trending Now" items={home.trending} testid="row-trending" />

        <Row
          title="Popular Movies"
          items={home.popularMovies}
          testid="row-popular-movies"
        />

        <Row
          title="Top Rated Movies"
          items={home.topRatedMovies}
          testid="row-top-rated-movies"
        />

        <Row
          title="Popular Series"
          items={home.popularSeries}
          testid="row-popular-series"
        />

        <Row
          title="Top Rated Series"
          items={home.topRatedSeries}
          testid="row-top-rated-series"
        />
      </div>
    </div>
  );
}
