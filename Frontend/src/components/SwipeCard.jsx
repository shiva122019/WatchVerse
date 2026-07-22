import { motion, useMotionValue, useTransform } from "framer-motion";

const SWIPE_THRESHOLD = 150;

export default function SwipeCard({ card, onSwipe }) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-300, 300], [-18, 18]);

  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const dislikeOpacity = useTransform(x, [-120, 0], [1, 0]);

  function handleDragEnd(_, info) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe("right");
      return;
    }

    if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe("left");
      return;
    }

    x.set(0);
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      style={{
        x,
        rotate,
      }}
      onDragEnd={handleDragEnd}
      className="absolute w-[360px] h-[580px] rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl cursor-grab active:cursor-grabbing select-none"
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${card.poster}`}
        alt={card.title}
        className="w-full h-full object-cover"
      />

      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-8 border-4 border-green-500 rounded-xl px-4 py-2 text-green-500 font-bold text-3xl rotate-[-20deg]"
      >
        LIKE
      </motion.div>

      <motion.div
        style={{ opacity: dislikeOpacity }}
        className="absolute top-8 right-8 border-4 border-red-500 rounded-xl px-4 py-2 text-red-500 font-bold text-3xl rotate-[20deg]"
      >
        NOPE
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
        <h2 className="text-white text-3xl font-bold">{card.title}</h2>

        <p className="text-gray-300 mt-2 line-clamp-4">{card.overview}</p>

        <div className="flex justify-between mt-4 text-gray-400">
          <span>⭐ {card.rating.toFixed(1)}</span>

          <span>{card.mediaType.toUpperCase()}</span>
        </div>
      </div>
    </motion.div>
  );
}
