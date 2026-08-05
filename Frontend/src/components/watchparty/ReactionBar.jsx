import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🍿"];

// Floating burst of emojis that rise and fade — mount this once, above your
// movie/player area, and feed it every incoming "reaction" socket event.
export function ReactionOverlay({ incoming }) {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!incoming) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const left = 10 + Math.random() * 80; // vw-ish position within the container
    setBursts((prev) => [...prev, { id, emoji: incoming.emoji, left }]);

    const timer = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 2200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming]);

  return (
    // z-20 is the fix: TrailerPlayer's own root is `position: relative`
    // too (it needs that for its internal controls), and without an
    // explicit z-index here, whichever positioned element comes LATER in
    // the DOM wins the paint order — which was TrailerPlayer, so every
    // reaction was rendering invisibly underneath the video. An explicit
    // z-index forces this overlay above it regardless of DOM order.
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -180, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute bottom-4 text-3xl"
            style={{ left: `${b.left}%` }}
          >
            {b.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function ReactionBar({ onReact }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="rounded-full px-2 py-1 text-xl transition hover:scale-125 hover:bg-white/10"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}