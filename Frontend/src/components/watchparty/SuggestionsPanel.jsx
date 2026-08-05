import { useEffect, useMemo, useState } from "react";
import { Shuffle, RefreshCw, Sparkles, Film, Play, Plus, Star, ChevronRight, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function dedupe(items) {
  const seen = new Set();
  return items.filter((it) => {
    const key = `${it.mediaType}-${it.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// TMDB doesn't give us a "match with this room" percentage, so this is a
// stand-in derived from the /5 rating scale already used elsewhere in the
// app — good enough for a glanceable badge, not a real recommendation score.
function matchPercent(item) {
  return Math.min(99, Math.round((item.rating / 5) * 100));
}

function PosterCard({ item, onSelect }) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="group flex w-36 shrink-0 flex-col gap-2 text-left"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-600">
            <Film className="h-5 w-5" />
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-[#5CF2E3]">
          {matchPercent(item)}% match
        </span>
      </div>
      <div>
        <p className="line-clamp-2 text-sm font-medium text-white">{item.title}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{item.year}</p>
      </div>
    </button>
  );
}

function sortByYearDesc(items) {
  return [...items].sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
}

function CollectionRow({ group, onSelect }) {
  const combined = sortByYearDesc(dedupe([...group.topRated, ...group.latest]));
  if (combined.length === 0) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-300">{group.genre}</h3>
        <ChevronRight className="h-4 w-4 text-neutral-600" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {combined.map((item) => (
          <PosterCard key={`${item.mediaType}-${item.id}`} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default function SuggestionsPanel({ genres, onSelectMovie, onChangeGenres, onBack }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [surprising, setSurprising] = useState(false);

  const genreKey = genres.join(",");

  useEffect(() => {
    if (!genreKey) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/watchparty/suggestions?genres=${encodeURIComponent(genreKey)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Couldn't load suggestions");
        if (!cancelled) setSuggestions(data.suggestions || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load suggestions. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [genreKey]);

  const surpriseUs = async () => {
    setSurprising(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/watchparty/surprise?genres=${encodeURIComponent(genreKey)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't get a surprise pick");
      if (data.pick) onSelectMovie(data.pick);
    } catch (err) {
      setError(err.message || "Couldn't get a surprise pick. Try again.");
    } finally {
      setSurprising(false);
    }
  };

  // Best match: highest-rated item across every genre's top-rated bucket.
  // More picks: the next several, everything else falls into the
  // per-genre "Other collections" rows below.
  const { bestMatch, morePicks } = useMemo(() => {
    const pool = dedupe(suggestions.flatMap((g) => [...g.topRated, ...g.latest]));
    if (pool.length === 0) return { bestMatch: null, morePicks: [] };

    // Best match is still the highest-rated pick — everything else (the
    // row beneath it, and every collection further down) runs newest
    // release to oldest.
    const ranked = [...pool].sort((a, b) => b.rating - a.rating || b.popularity - a.popularity);
    const [first] = ranked;
    const rest = sortByYearDesc(pool.filter((it) => it.id !== first.id || it.mediaType !== first.mediaType));
    return { bestMatch: first, morePicks: rest.slice(0, 8) };
  }, [suggestions]);

  return (
    <div className="flex h-full w-full flex-col p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack || onChangeGenres}
              className="rounded-full p-1 -ml-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5CF2E3]">
              Step 2 of 2
            </span>
            <div className="flex gap-1">
              <span className="h-1 w-4 rounded-full bg-[#5CF2E3]" />
              <span className="h-1 w-4 rounded-full bg-[#5CF2E3]" />
            </div>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">Pick something to watch</h2>
          <p className="mt-0.5 text-xs text-neutral-500">Based on the genres you picked</p>
        </div>
        <button
          onClick={onChangeGenres}
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Change genres
        </button>
      </div>

      <button
        onClick={surpriseUs}
        disabled={surprising}
        className="mt-4 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-[#04223a] disabled:opacity-60"
        style={{ background: "linear-gradient(90deg, #5CF2E3 0%, #8B5CF6 100%)" }}
      >
        <Shuffle className="h-4 w-4" />
        {surprising ? "Picking something…" : "Surprise us"}
      </button>

      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

      <div className="mt-6 min-h-0 flex-1 space-y-7 overflow-y-auto">
        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-500">Finding suggestions…</p>
        ) : suggestions.length === 0 && !error ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-neutral-500">
            <Sparkles className="h-6 w-6" />
            <p>No suggestions found for these genres.</p>
          </div>
        ) : (
          <>
            {bestMatch && (
              <div>
                <span className="mb-2 inline-block rounded-full bg-[#5CF2E3]/15 px-2.5 py-1 text-[11px] font-semibold text-[#5CF2E3]">
                  Best match
                </span>
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl bg-white/5">
                    {bestMatch.posterUrl ? (
                      <img
                        src={bestMatch.posterUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-600">
                        <Film className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{bestMatch.title}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {bestMatch.year} · {bestMatch.genre}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-sm text-neutral-300">
                        <Star className="h-3.5 w-3.5 fill-[#5CF2E3] text-[#5CF2E3]" />
                        {bestMatch.rating}/5 · {matchPercent(bestMatch)}% match
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => onSelectMovie(bestMatch)}
                        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#04223a]"
                        style={{ background: "linear-gradient(90deg, #5CF2E3 0%, #8B5CF6 100%)" }}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Watch trailer
                      </button>
                      <button
                        disabled
                        title="Watchlists are coming soon"
                        className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-neutral-400 opacity-60"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add to list
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {morePicks.length > 0 && (
              <div>
                <h3 className="mb-2.5 text-sm font-semibold text-neutral-300">More picks for you</h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {morePicks.map((item) => (
                    <PosterCard
                      key={`${item.mediaType}-${item.id}`}
                      item={item}
                      onSelect={onSelectMovie}
                    />
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Other collections
                </h3>
                <div className="mt-3 space-y-6">
                  {suggestions.map((group) => (
                    <CollectionRow key={group.genre} group={group} onSelect={onSelectMovie} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}