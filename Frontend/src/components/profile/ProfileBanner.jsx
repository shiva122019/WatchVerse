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
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.15)_0%,transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,0,85,0.12)_0%,transparent_55%)] bg-zinc-950 relative">
            <div className="absolute inset-0 opacity-[0.15] bg-[repeating-linear-gradient(115deg,transparent,transparent_2px,#fff_2px,#fff_3px)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

        <button
          type="button"
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-[#00F0FF]/60 hover:text-[#00F0FF] hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]"
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
          className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-black bg-[#111111] shadow-xl shadow-black/40 overflow-hidden"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#00F0FF]/25 via-zinc-900 to-[#FF0055]/25 text-2xl sm:text-3xl font-bold text-white border border-white/5 font-display">
              {initials || <User size={32} />}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
