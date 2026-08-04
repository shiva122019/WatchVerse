import { motion } from "framer-motion";
import { Film, Star } from "lucide-react";

export default function MediaCarousel({ items }) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-none">
      {items.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          whileHover={{ y: -4 }}
          className="w-32 flex-shrink-0 sm:w-36"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800">
            {item.posterUrl ? (
              <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">
                <Film size={22} />
              </div>
            )}
            {item.rating && (
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-zinc-950/80 px-1.5 py-0.5 text-[11px] font-medium text-red-400 backdrop-blur-sm">
                <Star size={10} fill="currentColor" />
                {item.rating}
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-medium text-zinc-200">{item.title}</p>
          {item.year && <p className="text-xs text-zinc-500">{item.year}</p>}
        </motion.div>
      ))}
    </div>
  );
}
