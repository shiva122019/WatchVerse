import { motion } from "framer-motion";
import { Film, Star } from "lucide-react";
import MediaCard from "../MediaCard";

export default function MediaCarousel({ items }) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-none relative z-10">
      {items.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          whileHover={{ y: -4 }}
          className="w-32 flex-shrink-0 sm:w-36 group cursor-pointer"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-md">
            {item.posterUrl ? (
              <img
                src={item.posterUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-600 transition duration-500 group-hover:scale-[1.06]">
                <Film size={22} />
              </div>
            )}
            {item.rating && (
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-zinc-950/80 px-1.5 py-0.5 text-[11px] font-medium text-[#FFB300] backdrop-blur-sm drop-shadow-[0_0_4px_rgba(255,179,0,0.2)]">
                <Star size={10} fill="currentColor" />
                {item.rating}
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-medium text-neutral-200 font-display group-hover:text-[#00F0FF] transition-colors">
            {item.title}
          </p>
          {item.year && <p className="text-xs text-neutral-500">{item.year}</p>}
        </motion.div>
      ))}
    </div>
  );
}
