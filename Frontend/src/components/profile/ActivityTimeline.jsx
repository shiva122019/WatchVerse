import { motion } from "framer-motion";
import { Star, Plus, Heart } from "lucide-react";

function EntryIcon({ text }) {
  if (text.toLowerCase().includes("rated") || text.toLowerCase().includes("reviewed")) {
    return <Star size={13} />;
  }
  if (text.toLowerCase().includes("liked")) return <Heart size={13} />;
  return <Plus size={13} />;
}

export default function ActivityTimeline({ groups }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-1 bottom-1 w-px bg-zinc-800" />

      <div className="space-y-8">
        {groups.map((group, gIdx) => (
          <div key={group.id} className="relative">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {group.label}
            </p>
            <div className="space-y-3">
              {group.entries.map((entry, eIdx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (gIdx * group.entries.length + eIdx) * 0.04 }}
                  className="relative flex items-start gap-3"
                >
                  <span className="absolute -left-6 mt-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-red-500">
                    <EntryIcon text={entry.text} />
                  </span>
                  <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300">
                    {entry.text}
                    {entry.rating && (
                      <span className="ml-2 text-red-500">{"★".repeat(entry.rating)}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
