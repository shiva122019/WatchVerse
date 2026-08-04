import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";

/**
 * Large banner with the avatar overlapping the bottom edge.
 * Falls back to attractive gradient placeholders when no images exist.
 */
export default function ProfileBanner({ bannerUrl, avatarUrl, displayName }) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-b-2xl sm:rounded-2xl">
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#3f0d0d_0%,transparent_45%),radial-gradient(circle_at_80%_0%,#1c1c22_0%,transparent_55%)] bg-zinc-900 relative">
            <div className="absolute inset-0 opacity-[0.15] bg-[repeating-linear-gradient(115deg,transparent,transparent_2px,#fff_2px,#fff_3px)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

        <button
          type="button"
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-zinc-700/70 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm transition-colors hover:border-red-600/60 hover:text-white"
        >
          <Camera size={14} />
          <span className="hidden sm:inline">Change banner</span>
        </button>
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-12 left-6 sm:left-10">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-zinc-950 bg-zinc-800 shadow-xl shadow-black/40 overflow-hidden"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-600/30 to-zinc-800 text-2xl sm:text-3xl font-bold text-zinc-100">
              {initials || <User size={32} />}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
