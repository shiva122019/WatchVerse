import { motion } from "framer-motion";

export default function ProgressBar({ current, total }) {
  const percentage = total === 0 ? 0 : Math.min((current / total) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">
          Discover Your Taste
        </span>

        <span className="text-sm text-gray-400">
          {current} / {total}
        </span>
      </div>

      <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500"
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}
