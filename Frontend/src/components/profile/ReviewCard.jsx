import { motion } from "framer-motion";
import { Star, Clapperboard } from "lucide-react";

function StarRow({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-0.5 text-[#FFB300] drop-shadow-[0_0_4px_rgba(255,179,0,0.2)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < full || (i === full && half) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReviewCard({ review }) {
  return (
    <motion.div
      whileHover={{ y: -3, borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 rounded-2xl glass p-4 shadow-md transition-all"
    >
      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white/5 border border-white/10">
        {review.posterUrl ? (
          <img src={review.posterUrl} alt={review.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-600">
            <Clapperboard size={18} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate font-semibold text-white font-display">{review.title}</h4>
          <span className="flex-shrink-0 text-xs text-zinc-500">{formatDate(review.date)}</span>
        </div>
        <div className="mt-1">
          <StarRow rating={review.rating} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400 leading-relaxed">{review.body}</p>
      </div>
    </motion.div>
  );
}
