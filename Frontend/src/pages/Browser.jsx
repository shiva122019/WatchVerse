import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";
import { Search } from "lucide-react";

const TYPES = [
  { value: "", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
  { value: "song", label: "Music" },
];

const GENRES = [
  "Drama", "Sci-Fi", "Thriller", "Mystery", "Action", "Comedy",
  "Romance", "Horror", "Fantasy", "Synthwave", "Indie", "Pop", "Jazz", "Folk",
];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const type = params.get("type") || "";
  const genre = params.get("genre") || "";
  const q = params.get("q") || "";

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setLoading(true);
    api
      .get("/content", {
        params: {
          ...(type ? { type } : {}),
          ...(genre ? { genre } : {}),
          ...(q ? { q } : {}),
          limit: 100,
        },
      })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [type, genre, q]);

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

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10" data-testid="browse-page">
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

      {/* Genre chips */}
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
        {GENRES.map((g) => (
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

      {loading ? (
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
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          data-testid="browse-grid"
        >
          {items.map((it) => (
            <MediaCard key={it.id} item={it} width="w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
