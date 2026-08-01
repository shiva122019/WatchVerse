import { AnimatePresence, motion } from "framer-motion";
import { X, HelpCircle, Check, Heart } from "lucide-react";
import SwipeCard from "./SwipeCard";

export default function SwipeStack({ cards, currentIndex, onSwipe }) {
  if (!cards.length || currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center gap-6 py-20">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg font-display"
        >
          All done! Saving your taste…
        </motion.p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];
  const thirdCard = cards[currentIndex + 2];

  function handleSwipe(direction) {
    onSwipe(direction, currentCard);
  }

  function handleSuperLike() {
    onSwipe("superlike", currentCard);
  }

  // Button tap handlers trigger programmatic swipe
  function triggerSwipe(direction) {
    onSwipe(direction, currentCard);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* ── Card Stack ── */}
      <div className="relative w-[340px] h-[520px] sm:w-[370px] sm:h-[560px]">
        {/* 3rd card (deepest) */}
        {thirdCard && (
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ scale: 0.88, y: 16, opacity: 0.3 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${thirdCard.poster}`}
              alt={thirdCard.title}
              className="w-full h-full rounded-[28px] object-cover blur-[2px]"
              draggable={false}
            />
            <div className="absolute inset-0 rounded-[28px] bg-black/40" />
          </motion.div>
        )}

        {/* 2nd card (behind current) */}
        {nextCard && (
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ scale: 0.94, y: 8, opacity: 0.55 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${nextCard.poster}`}
              alt={nextCard.title}
              className="w-full h-full rounded-[28px] object-cover blur-[1px]"
              draggable={false}
            />
            <div className="absolute inset-0 rounded-[28px] bg-black/25" />
          </motion.div>
        )}

        {/* Current card with AnimatePresence for exit */}
        <AnimatePresence mode="popLayout">
          <SwipeCard
            key={`${currentCard.mediaType}-${currentCard.id}`}
            card={currentCard}
            onSwipe={handleSwipe}
            onSuperLike={handleSuperLike}
          />
        </AnimatePresence>
      </div>

      {/* ── Action Button Bar ── */}
      <div className="flex items-center gap-4">
        {/* Nope */}
        <ActionButton
          onClick={() => triggerSwipe("left")}
          color="red"
          icon={<X className="w-6 h-6" strokeWidth={2.5} />}
          label="Nope"
          id="action-nope"
        />

        {/* Haven't Seen */}
        <ActionButton
          onClick={() => triggerSwipe("up")}
          color="cyan"
          icon={<HelpCircle className="w-5 h-5" strokeWidth={2.5} />}
          label="Unseen"
          size="sm"
          id="action-unseen"
        />

        {/* Like */}
        <ActionButton
          onClick={() => triggerSwipe("right")}
          color="green"
          icon={<Check className="w-6 h-6" strokeWidth={2.5} />}
          label="Like"
          id="action-like"
        />

        {/* Super Like */}
        <ActionButton
          onClick={() => triggerSwipe("superlike")}
          color="pink"
          icon={<Heart className="w-5 h-5 fill-current" strokeWidth={0} />}
          label="Love"
          size="sm"
          id="action-superlike"
        />
      </div>

      {/* ── Gesture hint ── */}
      <div className="flex items-center gap-6 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
        <span>← Nope</span>
        <span className="text-neutral-700">·</span>
        <span>↑ Unseen</span>
        <span className="text-neutral-700">·</span>
        <span>Like →</span>
      </div>
    </div>
  );
}

/* ── Reusable Action Button ── */
const colorMap = {
  red: {
    border: "border-red-500/40",
    hoverBorder: "hover:border-red-400",
    text: "text-red-400",
    shadow: "hover:shadow-red-500/20",
    bg: "hover:bg-red-500/10",
  },
  cyan: {
    border: "border-cyan-500/40",
    hoverBorder: "hover:border-cyan-400",
    text: "text-cyan-400",
    shadow: "hover:shadow-cyan-500/20",
    bg: "hover:bg-cyan-500/10",
  },
  green: {
    border: "border-emerald-500/40",
    hoverBorder: "hover:border-emerald-400",
    text: "text-emerald-400",
    shadow: "hover:shadow-emerald-500/20",
    bg: "hover:bg-emerald-500/10",
  },
  pink: {
    border: "border-pink-500/40",
    hoverBorder: "hover:border-pink-400",
    text: "text-pink-400",
    shadow: "hover:shadow-pink-500/20",
    bg: "hover:bg-pink-500/10",
  },
};

function ActionButton({ onClick, color, icon, label, size = "md", id }) {
  const c = colorMap[color];
  const dimension = size === "sm" ? "w-12 h-12" : "w-14 h-14";

  return (
    <button
      onClick={onClick}
      id={id}
      aria-label={label}
      className={`${dimension} rounded-full border-2 ${c.border} ${c.hoverBorder} ${c.text} ${c.bg} ${c.shadow}
        flex items-center justify-center transition-all duration-200
        hover:scale-110 hover:shadow-lg active:scale-95
        bg-neutral-900/80 backdrop-blur-sm`}
    >
      {icon}
    </button>
  );
}
