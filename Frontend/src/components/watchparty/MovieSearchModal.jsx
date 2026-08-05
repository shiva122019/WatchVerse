import { useEffect, useRef, useState } from "react";
import { X, Search, Film } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function MovieSearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE}/watchparty/search?query=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search failed");
        setResults(data.results || []);
      } catch (err) {
        setError(err.message || "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a movie or show..."
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

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">Searching…</p>
          )}

          {!loading && error && (
            <p className="px-3 py-6 text-center text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && query.trim() && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">
              No matches. Try a different title.
            </p>
          )}

          {!loading &&
            results.map((r) => (
              <button
                key={`${r.mediaType}-${r.id}`}
                onClick={() => onSelect(r)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
              >
                {r.posterUrl ? (
                  <img
                    src={r.posterUrl}
                    alt=""
                    className="h-16 w-11 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-white/5">
                    <Film className="h-4 w-4 text-neutral-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{r.title}</p>
                  <p className="text-xs text-neutral-500">
                    {r.mediaType === "tv" ? "Series" : "Movie"}
                    {r.year ? ` · ${r.year}` : ""}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
