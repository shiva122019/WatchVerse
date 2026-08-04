import { useEffect, useState } from "react";
import {
  X,
  Check,
  ArrowLeft,
  Zap,
  Smile,
  Film,
  Eye,
  Heart,
  Users,
  Sparkles,
  Wand2,
  ShieldAlert,
  Ghost,
  Search,
  Landmark,
  ArrowRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Icon, accent color, and one-line descriptor per genre — mirrors the
// "what are we in the mood for" picker. Anything not listed here (or not
// returned by TMDB for this title type) falls back to DEFAULT_META below.
const GENRE_META = {
  Action: { icon: Zap, color: "#38bdf8", desc: "High adrenaline" },
  Comedy: { icon: Smile, color: "#fbbf24", desc: "Laugh together" },
  Drama: { icon: Film, color: "#a78bfa", desc: "Emotional stories" },
  Thriller: { icon: Eye, color: "#e5e7eb", desc: "Keep you guessing" },
  Romance: { icon: Heart, color: "#fb7185", desc: "Love & connection" },
  Family: { icon: Users, color: "#60a5fa", desc: "Perfect for all" },
  Animation: { icon: Sparkles, color: "#facc15", desc: "Fun & imaginative" },
  Fantasy: { icon: Wand2, color: "#c084fc", desc: "Magic & myths" },
  Crime: { icon: ShieldAlert, color: "#60a5fa", desc: "Mysteries & heists" },
  Horror: { icon: Ghost, color: "#9ca3af", desc: "Spooky & scary" },
  Mystery: { icon: Search, color: "#9ca3af", desc: "Unsolved secrets" },
  History: { icon: Landmark, color: "#d6b88a", desc: "Real events" },
};
const DEFAULT_META = { icon: Film, color: "#5CF2E3", desc: "More to explore" };

// Grouping is presentational only — it doesn't change what genres exist,
// just how they're clustered on screen. Anything the API returns that
// isn't in one of these buckets lands in "More genres" automatically.
const CATEGORY_DEFS = [
  { label: "Popular", genres: ["Action", "Comedy", "Drama", "Thriller"] },
  { label: "Feel good", genres: ["Romance", "Family", "Animation", "Fantasy"] },
  { label: "Dark & intense", genres: ["Crime", "Horror", "Mystery", "History"] },
];

function groupGenres(allGenres) {
  const categorized = new Set(CATEGORY_DEFS.flatMap((c) => c.genres));
  const groups = CATEGORY_DEFS.map((def) => ({
    label: def.label,
    genres: def.genres.filter((g) => allGenres.includes(g)),
  })).filter((c) => c.genres.length > 0);

  const rest = allGenres.filter((g) => !categorized.has(g));
  if (rest.length > 0) groups.push({ label: "More genres", genres: rest });
  return groups;
}

export default function GenreSelectModal({ onClose, onBack, onSubmit, initialGenres = [] }) {
  const [allGenres, setAllGenres] = useState([]);
  const [selected, setSelected] = useState(new Set(initialGenres));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/watchparty/genres`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Couldn't load genres");
        if (!cancelled) setAllGenres(data.genres || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load genres. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (genre) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  };

  const remove = (genre) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(genre);
      return next;
    });
  };

  const submit = () => {
    if (selected.size === 0) return;
    onSubmit(Array.from(selected));
  };

  const groups = groupGenres(allGenres);
  const selectedList = Array.from(selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A12] shadow-2xl">
        {/* header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBack || onClose}
                className="rounded-full p-1 -ml-1 text-neutral-400 hover:bg-white/10 hover:text-white"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#5CF2E3]">
                Step 1 of 2
              </span>
              <div className="flex gap-1">
                <span className="h-1 w-4 rounded-full bg-[#5CF2E3]" />
                <span className="h-1 w-4 rounded-full bg-white/15" />
              </div>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              What are we in the mood for?
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Pick as many vibes as you want — we'll find the matches.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* genre grid */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-neutral-500">Loading genres…</p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-400">{error}</p>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.label}>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {group.genres.map((genre) => {
                      const meta = GENRE_META[genre] || DEFAULT_META;
                      const Icon = meta.icon;
                      const active = selected.has(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggle(genre)}
                          className="relative flex flex-col gap-1.5 rounded-lg border px-2.5 py-2 text-left transition"
                          style={{
                            borderColor: active ? "#5CF2E3" : "rgba(255,255,255,0.1)",
                            background: active ? "rgba(92,242,227,0.06)" : "rgba(255,255,255,0.02)",
                          }}
                        >
                          {active && (
                            <span className="absolute right-2 top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#5CF2E3]">
                              <Check className="h-2.5 w-2.5 text-[#04342C]" strokeWidth={3} />
                            </span>
                          )}
                          <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                          <div>
                            <p className="text-[13px] font-medium text-white">{genre}</p>
                            <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                              {meta.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer: selected chips + continue */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#0A0A12] px-6 py-4">
          {selectedList.length === 0 ? (
            <span className="text-sm text-neutral-500">No genres selected yet</span>
          ) : (
            <>
              {selectedList.map((genre) => (
                <span
                  key={genre}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-1 pl-3 pr-2 text-xs text-neutral-200"
                >
                  {genre}
                  <button
                    onClick={() => remove(genre)}
                    className="rounded-full p-0.5 text-neutral-400 hover:bg-white/10 hover:text-white"
                    aria-label={`Remove ${genre}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <span className="text-xs text-neutral-500">
                {selectedList.length} genre{selectedList.length > 1 ? "s" : ""} selected
              </span>
            </>
          )}

          <button
            onClick={submit}
            disabled={selected.size === 0}
            className="ml-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#04223a] transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "linear-gradient(90deg, #5CF2E3 0%, #8B5CF6 100%)",
            }}
          >
            Next: Find movies
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}