import { motion } from "framer-motion";

const ACTION_COLORS = {
  right: "#34d399",   // emerald-400 (like)
  left: "#f87171",    // red-400 (nope)
  up: "#22d3ee",      // cyan-400 (unseen)
  superlike: "#f472b6", // pink-400 (love)
};

export default function ProgressBar({ current, total, actions = [] }) {
  const percentage = total === 0 ? 0 : Math.min((current / total) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          Discover Your Taste
        </span>

        <span className="text-xs text-gray-500 font-mono-alt tabular-nums">
          {current} / {total}
        </span>
      </div>

      {/* Track */}
      <div className="relative w-full h-2 bg-neutral-800/80 rounded-full overflow-hidden">
        {/* Animated fill */}
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #f43f5e, #ec4899, #a855f7, #06b6d4)",
          }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.8, 0.25, 1],
          }}
        />

        {/* Glow on the leading edge */}
        <motion.div
          className="absolute top-0 h-full w-4 rounded-full"
          style={{
            background:
              "radial-gradient(circle at right, rgba(168,85,247,0.6), transparent)",
          }}
          animate={{
            left: `calc(${percentage}% - 1rem)`,
            opacity: percentage > 2 ? 1 : 0,
          }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.8, 0.25, 1],
          }}
        />
      </div>

      {/* Action dots — shows last 30 actions as colored dots */}
      {actions.length > 0 && (
        <div className="flex items-center gap-[3px] mt-2.5 justify-center flex-wrap">
          {actions.slice(-30).map((action, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: i === actions.slice(-30).length - 1 ? 0.1 : 0,
              }}
              className="w-[6px] h-[6px] rounded-full"
              style={{
                backgroundColor: ACTION_COLORS[action] || "#525252",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
