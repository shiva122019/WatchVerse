import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Heart, X, HelpCircle, Check } from "lucide-react";

const SWIPE_X_THRESHOLD = 120;
const SWIPE_Y_THRESHOLD = 100;

export default function SwipeCard({ card, onSwipe, onSuperLike }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [exitDirection, setExitDirection] = useState(null);
  const cardRef = useRef(null);

  // Rotates with horizontal drag
  const rotate = useTransform(x, [-300, 300], [-15, 15]);

  // Stamp opacities driven by drag position
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const unseenOpacity = useTransform(y, [-100, 0], [1, 0]);

  // Background overlay tints
  const likeOverlay = useTransform(
    x,
    [0, 150],
    ["rgba(34,197,94,0)", "rgba(34,197,94,0.15)"]
  );
  const nopeOverlay = useTransform(
    x,
    [-150, 0],
    ["rgba(239,68,68,0.15)", "rgba(239,68,68,0)"]
  );
  const unseenOverlay = useTransform(
    y,
    [-150, 0],
    ["rgba(0,240,255,0.15)", "rgba(0,240,255,0)"]
  );

  // Card scale when being dragged
  const scale = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [0.95, 1, 1, 1, 0.95]
  );

  function handleDragEnd(_, info) {
    const { offset, velocity } = info;

    // Swipe up — "Haven't Seen"
    if (offset.y < -SWIPE_Y_THRESHOLD && Math.abs(offset.y) > Math.abs(offset.x)) {
      setExitDirection("up");
      animate(y, -800, { duration: 0.35 });
      animate(x, offset.x * 0.5, { duration: 0.35 });
      setTimeout(() => onSwipe("up"), 300);
      return;
    }

    // Swipe right — "Like"
    if (offset.x > SWIPE_X_THRESHOLD) {
      setExitDirection("right");
      animate(x, 600, { duration: 0.35 });
      animate(y, offset.y * 0.3, { duration: 0.35 });
      setTimeout(() => onSwipe("right"), 300);
      return;
    }

    // Swipe left — "Nope"
    if (offset.x < -SWIPE_X_THRESHOLD) {
      setExitDirection("left");
      animate(x, -600, { duration: 0.35 });
      animate(y, offset.y * 0.3, { duration: 0.35 });
      setTimeout(() => onSwipe("left"), 300);
      return;
    }

    // Snap back
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
  }

  function handleSuperLike() {
    setExitDirection("superlike");
    animate(y, -200, { duration: 0.4, ease: "easeOut" });
    setTimeout(() => {
      animate(y, -800, { duration: 0.3 });
      setTimeout(() => onSuperLike(), 250);
    }, 150);
  }

  const releaseDate = card.releaseDate
    ? new Date(card.releaseDate).getFullYear()
    : "";

  return (
    <motion.div
      ref={cardRef}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.15}
      style={{
        x,
        y,
        rotate,
        scale,
      }}
      onDragEnd={handleDragEnd}
      className="absolute w-[340px] h-[520px] sm:w-[370px] sm:h-[560px] rounded-[28px] overflow-hidden cursor-grab active:cursor-grabbing select-none will-change-transform"
      id="swipe-card"
    >
      {/* Poster image */}
      <img
        src={`https://image.tmdb.org/t/p/w500${card.poster}`}
        alt={card.title}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Color overlays on drag */}
      <motion.div
        style={{ background: likeOverlay }}
        className="absolute inset-0 pointer-events-none"
      />
      <motion.div
        style={{ background: nopeOverlay }}
        className="absolute inset-0 pointer-events-none"
      />
      <motion.div
        style={{ background: unseenOverlay }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Card border glow */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.08), 0 25px 60px rgba(0,0,0,0.5)",
        }}
      />

      {/* ── STAMP: LIKE (right) ── */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-6 z-10 flex items-center gap-2 border-[3px] border-emerald-400 rounded-2xl px-4 py-2 rotate-[-12deg]"
      >
        <Check className="w-7 h-7 text-emerald-400" strokeWidth={3} />
        <span className="text-emerald-400 font-bold text-2xl tracking-wide font-display">
          LIKE
        </span>
      </motion.div>

      {/* ── STAMP: NOPE (left) ── */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-8 right-6 z-10 flex items-center gap-2 border-[3px] border-red-400 rounded-2xl px-4 py-2 rotate-[12deg]"
      >
        <X className="w-7 h-7 text-red-400" strokeWidth={3} />
        <span className="text-red-400 font-bold text-2xl tracking-wide font-display">
          NOPE
        </span>
      </motion.div>

      {/* ── STAMP: HAVEN'T SEEN (up) ── */}
      <motion.div
        style={{ opacity: unseenOpacity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 border-[3px] border-cyan-400 rounded-2xl px-5 py-3"
      >
        <HelpCircle className="w-8 h-8 text-cyan-400" strokeWidth={2.5} />
        <span className="text-cyan-400 font-bold text-lg tracking-wide font-display whitespace-nowrap">
          HAVEN'T SEEN
        </span>
      </motion.div>

      {/* ── Bottom info panel (glassmorphism) ── */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none">
        {/* Gradient fade */}
        <div className="h-48 bg-gradient-to-t from-black via-black/80 to-transparent" />

        {/* Info content */}
        <div className="absolute bottom-0 inset-x-0 p-5 pb-6">
          <h2 className="text-white text-2xl sm:text-[1.65rem] font-bold font-display leading-tight line-clamp-2">
            {card.title}
          </h2>

          <p className="text-gray-300/80 text-sm mt-2 line-clamp-2 leading-relaxed">
            {card.overview}
          </p>

          <div className="flex items-center gap-3 mt-3">
            {/* Rating badge */}
            <span className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {card.rating.toFixed(1)}
            </span>

            {/* Year */}
            {releaseDate && (
              <span className="text-gray-400 text-sm">{releaseDate}</span>
            )}

            {/* Media type badge */}
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase bg-white/10 text-gray-300 border border-white/10">
              {card.mediaType === "tv" ? "TV Show" : "Movie"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Super Like heart button ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSuperLike();
        }}
        className="absolute top-6 right-6 z-20 pointer-events-auto group"
        aria-label="Super Like"
        id="super-like-btn"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 transition-all duration-200 group-hover:scale-110 group-hover:shadow-pink-500/50 group-active:scale-95">
          <Heart
            className="w-6 h-6 text-white fill-white"
            strokeWidth={0}
          />
        </div>
      </button>
    </motion.div>
  );
}
