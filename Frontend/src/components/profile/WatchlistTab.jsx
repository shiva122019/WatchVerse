import { useState } from "react";
import MediaCarousel from "./MediaCarousel";
import { motion } from "framer-motion";
import { Film, Play } from "lucide-react";
import EmptyState from "../ui/EmptyState";

const FILTERS = [
  { key: "wantToWatch", label: "Want to Watch" },
  { key: "watching", label: "Watching" },
  { key: "watched", label: "Watched" },
];

export default function WatchlistTab({ watchlist = {} }) {
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
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                isActive
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
            title={`Your ${FILTERS.find((f) => f.key === active)?.label || "Watchlist"} is Empty`}
            description="Discover new movies and shows to add to your list."
            minHeight="250px"
          />
        </div>
      ) : (
        <div className="mt-6">
          <MediaCarousel items={items} />
        </div>
      )}
    </div>
  );
}
