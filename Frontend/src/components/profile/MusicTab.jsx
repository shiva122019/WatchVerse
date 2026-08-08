import { motion } from "framer-motion";
import { Music } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export default function MusicTab({ music = [] }) {
  if (music.length === 0) {
    return (
      <div className="mt-8 relative z-10">
        <EmptyState
          icon={Music}
          title="No Music Added"
          description="Discover new songs and add them to your profile."
          minHeight="250px"
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 relative z-10">
      {music.map((item, idx) => (
        <motion.div
          key={item.entryId || item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.04 }}
          whileHover={{ y: -3 }}
          className="group cursor-pointer"
        >
          <a
            href={item.spotifyUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="aspect-square overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-md">
              {item.albumArt ? (
                <img
                  src={item.albumArt}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-600 transition duration-500 group-hover:scale-[1.06]">
                  <Music size={24} />
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-sm font-medium text-neutral-200 font-display group-hover:text-[#00F0FF] transition-colors">
              {item.title}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {item.artist || "Unknown Artist"}
            </p>
          </a>
        </motion.div>
      ))}
    </div>
  );
}
