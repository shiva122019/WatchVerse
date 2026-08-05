import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import MediaCard from "@/components/MediaCard";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const WATCH_TABS = [
  { key: "all", label: "All" },
  { key: "want", label: "Want to Watch" },
  { key: "watching", label: "Currently Watching" },
  { key: "watched", label: "Watched" },
];

const LISTEN_TABS = [
  { key: "all", label: "All" },
  { key: "want", label: "Want to Listen" },
  { key: "watching", label: "Listening" },
  { key: "watched", label: "Listened" },
];

const WATCH_STATUS_LABEL = {
  want: "want to watch",
  watching: "currently watching",
  watched: "watched",
};

const LISTEN_STATUS_LABEL = {
  want: "want to listen",
  watching: "listening",
  watched: "listened",
};

function ListSection({ title, items, tabs, statusLabels, onRemove }) {
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? items : items.filter((i) => i.status === tab);

  return (
    <section className="mb-14">
      <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            data-testid={`watchlist-tab-${title}-${t.key}`}
            className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition ${
              tab === t.key
                ? "border-[#00F0FF] bg-[#00F0FF] text-black"
                : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
            }`}
          >
            {t.label}
            <span className="ml-2 text-[10px] opacity-70">
              {t.key === "all"
                ? items.length
                : items.filter((i) => i.status === t.key).length}
            </span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-neutral-500">Nothing here yet.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-neutral-500">
            Nothing in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((w) =>
            w.content ? (
              <div key={w.id} className="relative">
                <MediaCard item={w.content} width="w-full" />
                <button
                  onClick={() => onRemove(w.content_id)}
                  data-testid={`watchlist-remove-${w.content_id}`}
                  className="absolute right-2 top-2 z-10 rounded-full border border-white/10 bg-black/70 p-2 text-neutral-300 backdrop-blur transition hover:border-[#FF0055] hover:text-[#FF0055]"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <span className="mt-1 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-neutral-400">
                  {statusLabels[w.status] || w.status}
                </span>
              </div>
            ) : null,
          )}
        </div>
      )}
    </section>
  );
}

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("movies"); // "movies" | "music"

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/watchlist/content");
      setItems(res.data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (content_id) => {
    await api.delete(`/watchlist/${content_id}`);
    toast.success("Removed");
    load();
  };

  const movieSeriesItems = items.filter((i) => i.content?.type !== "song");
  const songItems = items.filter((i) => i.content?.type === "song");

  return (
    <div
      className="mx-auto max-w-7xl px-6 py-12 md:px-10"
      data-testid="watchlist-page"
    >
      <div className="mb-6">
        <span className="label-caps text-cyan">Personal</span>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          My List
        </h1>
      </div>

      {!loading && items.length > 0 && (
        <div className="mb-10 flex gap-2">
          <button
            onClick={() => setSection("movies")}
            data-testid="watchlist-section-movies"
            className={`rounded-full border px-5 py-2 text-sm font-semibold tracking-wide transition ${
              section === "movies"
                ? "border-[#00F0FF] bg-[#00F0FF] text-black"
                : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
            }`}
          >
            Movies &amp; Series
            <span className="ml-2 text-[11px] opacity-70">
              {movieSeriesItems.length}
            </span>
          </button>
          <button
            onClick={() => setSection("music")}
            data-testid="watchlist-section-music"
            className={`rounded-full border px-5 py-2 text-sm font-semibold tracking-wide transition ${
              section === "music"
                ? "border-[#00F0FF] bg-[#00F0FF] text-black"
                : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/30"
            }`}
          >
            Music
            <span className="ml-2 text-[11px] opacity-70">
              {songItems.length}
            </span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-neutral-500">Loading…</div>
      ) : items.length === 0 ? (
        <div
          data-testid="watchlist-empty"
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center"
        >
          <p className="font-display text-2xl text-white">Nothing here yet</p>
          <p className="mt-2 text-sm text-neutral-500">
            Add movies, series, or music from any detail page.
          </p>
          <Link
            to="/browse"
            data-testid="watchlist-browse-link"
            className="mt-6 inline-flex rounded-full border border-[#00F0FF] px-5 py-2 text-xs font-bold text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black"
          >
            Browse catalog
          </Link>
        </div>
      ) : section === "movies" ? (
        <ListSection
          title="Movies & Series"
          items={movieSeriesItems}
          tabs={WATCH_TABS}
          statusLabels={WATCH_STATUS_LABEL}
          onRemove={remove}
        />
      ) : (
        <ListSection
          title="Music"
          items={songItems}
          tabs={LISTEN_TABS}
          statusLabels={LISTEN_STATUS_LABEL}
          onRemove={remove}
        />
      )}
    </div>
  );
}