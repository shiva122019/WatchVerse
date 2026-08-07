import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Play } from "lucide-react";
import EmptyState from "../ui/EmptyState";

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
      <div className="flex flex-wrap gap-2 relative z-10">
        {FILTERS.map(({ key, label }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${isActive
                  ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                  : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Play}
            title={`Your ${FILTERS.find(f => f.key === active)?.label || 'Watchlist'} is Empty`}
            description="Discover new movies and shows to add to your list."
            minHeight="250px"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 relative z-10">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ y: -3 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-md">
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-600 transition duration-500 group-hover:scale-[1.06]">
                    <Film size={20} />
                  </div>
                )}
              </div>
              <p className="mt-2 truncate text-sm font-medium text-neutral-200 font-display group-hover:text-[#00F0FF] transition-colors">{item.title}</p>
              <p className="text-xs text-neutral-500">{item.year}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
