import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Music, Users, ArrowUpRight, Sparkles } from "lucide-react";

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function SpotifyCard({ spotify }) {
  const navigate = useNavigate();

  if (!spotify.connected) {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-neutral-400">
            <Music size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Spotify Not Connected</h3>
            <p className="text-xs text-zinc-500">Link your account to unlock more</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" /> Import your favorite artists
          </li>
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" /> Get better recommendations
          </li>
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" /> Sync your listening history
          </li>
        </ul>

        <motion.button
          type="button"
          onClick={() => navigate("/settings/account")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] px-5 py-2.5 text-sm font-bold text-black transition-all hover:shadow-[0_0_15px_rgba(29,185,84,0.4)]"
        >
          <Music size={15} />
          Connect Spotify
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass rounded-2xl p-6 shadow-xl bg-gradient-to-br from-neutral-900/40 to-neutral-950/20"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
            <Music size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Spotify Connected</h3>
            <p className="text-xs text-zinc-500">@{spotify.username}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-400">
          <Users size={11} />
          {formatCount(spotify.followers)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Top Artists</p>
          <ul className="mt-2 space-y-1.5">
            {spotify.topArtists.map((artist) => (
              <li key={artist} className="text-sm text-zinc-300">{artist}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Top Genres</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {spotify.topGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 transition-colors hover:text-green-300"
      >
        View Spotify Profile
        <ArrowUpRight size={15} />
      </button>
    </motion.div>
  );
}
