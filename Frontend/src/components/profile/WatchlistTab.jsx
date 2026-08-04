import { useState } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";

const FILTERS = [
  { key: "wantToWatch", label: "Want to Watch" },
  { key: "watching", label: "Watching" },
  { key: "watched", label: "Watched" },
];

export default function WatchlistTab({ watchlist }) {
  const [active, setActive] = useState("wantToWatch");
  const items = watchlist[active] ?? [];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-red-600 bg-red-600/10 text-red-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">Nothing here yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ y: -3 }}
            >
              <div className="aspect-[2/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800">
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">
                    <Film size={20} />
                  </div>
                )}
              </div>
              <p className="mt-2 truncate text-sm font-medium text-zinc-200">{item.title}</p>
              <p className="text-xs text-zinc-500">{item.year}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
