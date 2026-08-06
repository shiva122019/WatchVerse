import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";
import MusicMediaCard from "@/components/MusicMediaCard";
import { Search } from "lucide-react";

const TYPES = [
  { value: "", label: "All" },
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

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const type = params.get("type") || "";
  const genre = params.get("genre") || "";
  const q = params.get("q") || "";

  const [searchInput, setSearchInput] = useState(q);

  // Which genre list applies to the currently selected type.
  const activeGenres = type === "song" ? MUSIC_GENRES : MOVIE_SERIES_GENRES;

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [type, genre, q]);

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
          ...(genre ? { genre } : {}),
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
  }, [type, genre, q, page]);

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

    // Switching content type: drop the current genre if it doesn't
    // belong to the new type's genre list (e.g. "Folk" selected,
    // then switching to Movies — Folk isn't a movie genre).
    if (key === "type") {
      const newGenreList =
        value === "song" ? MUSIC_GENRES : MOVIE_SERIES_GENRES;
      const currentGenre = params.get("genre");

      if (currentGenre && !newGenreList.includes(currentGenre)) {
        next.delete("genre");
      }
    }

    setParams(next);
  };

  const onSearch = (e) => {
    e.preventDefault();
    updateParam("q", searchInput.trim());
  };

  return (
    <div
      className="mx-auto max-w-7xl px-6 py-12 md:px-10"
      data-testid="browse-page"
    >
      <div className="mb-8 flex flex-col gap-2">
        <span className="label-caps text-cyan">Catalog</span>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Browse Everything
        </h1>
      </div>

      {/* Search */}
      <form
        onSubmit={onSearch}
        className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3"
      >
        <Search className="h-5 w-5 text-neutral-500" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search titles, creators, cast…"
          className="w-full bg-transparent text-base text-white placeholder:text-neutral-500 focus:outline-none"
          data-testid="browse-search-input"
        />
        <button
          type="submit"
          data-testid="browse-search-submit"
          className="rounded-full border border-[#00F0FF] px-4 py-1.5 text-xs font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black"
        >
          Search
        </button>
      </form>

      {/* Type filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value || "all"}
            onClick={() => updateParam("type", t.value)}
            data-testid={`filter-type-${t.value || "all"}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition ${
              type === t.value
                ? "border-[#00F0FF] bg-[#00F0FF] text-black"
                : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Genre chips — swap list based on selected type */}
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          onClick={() => updateParam("genre", "")}
          data-testid="filter-genre-all"
          className={`rounded-full border px-3 py-1 text-[11px] font-medium tracking-wider transition ${
            !genre
              ? "border-[#FFB300] text-[#FFB300]"
              : "border-white/10 text-neutral-400 hover:border-white/30 hover:text-neutral-200"
          }`}
        >
          All Genres
        </button>
        {activeGenres.map((g) => (
          <button
            key={g}
            onClick={() => updateParam("genre", g)}
            data-testid={`filter-genre-${g}`}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium tracking-wider transition ${
              genre === g
                ? "border-[#FFB300] text-[#FFB300]"
                : "border-white/10 text-neutral-400 hover:border-white/30 hover:text-neutral-200"
            }`}
          >
            {g}
          </button>
        ))}
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
            className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
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
  );
}