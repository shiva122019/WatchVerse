import { motion } from "framer-motion";
import { Film, Tv, Star, Users, UserPlus } from "lucide-react";

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ProfileStats({ stats }) {
  const items = [
    { key: "moviesWatched", label: "Movies Watched", icon: Film, value: stats.moviesWatched },
    { key: "showsWatched", label: "TV Shows Watched", icon: Tv, value: stats.showsWatched },
    { key: "reviews", label: "Reviews", icon: Star, value: stats.reviews },
    { key: "followers", label: "Followers", icon: Users, value: stats.followers },
    { key: "following", label: "Following", icon: UserPlus, value: stats.following },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {items.map(({ key, label, icon: Icon, value }) => (
        <motion.div
          key={key}
          variants={item}
          whileHover={{ y: -4, borderColor: "rgb(220 38 38 / 0.5)" }}
          transition={{ duration: 0.2 }}
          className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
        >
          <Icon size={18} className="text-zinc-500 transition-colors group-hover:text-red-500" />
          <div className="mt-3 text-xl sm:text-2xl font-bold text-white">{formatCount(value)}</div>
          <div className="mt-0.5 text-xs text-zinc-500">{label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
