import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Music, Users, ArrowUpRight, Sparkles, Unlink } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useState } from "react";

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function SpotifyCard({ spotify, onDisconnected }) {
  const navigate = useNavigate();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to disconnect your Spotify account?",
    );

    if (!confirmed) return;

    try {
      setDisconnecting(true);

      const response = await api.post("/auth/spotify/disconnect");

      if (response.data?.success) {
        toast.success("Spotify account disconnected");

        /*
         * Tell the parent Profile component to refresh its
         * Spotify/profile data.
         */
        if (onDisconnected) {
          onDisconnected();
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to disconnect Spotify",
        );
      }
    } catch (error) {
      console.error("Spotify disconnect error:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to disconnect Spotify",
      );
    } finally {
      setDisconnecting(false);
    }
  };

  if (!spotify.connected) {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1DB954]/15">
            <Music size={21} className="text-[#1DB954]" />
          </div>

          <div>
            <h3 className="font-semibold text-white">Spotify Not Connected</h3>

            <p className="text-sm text-zinc-400">
              Link your account to unlock more
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li className="flex items-center gap-2">
            <Sparkles
              size={14}
              className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]"
            />
            Import your favorite artists
          </li>

          <li className="flex items-center gap-2">
            <Sparkles
              size={14}
              className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]"
            />
            Get better recommendations
          </li>

          <li className="flex items-center gap-2">
            <Sparkles
              size={14}
              className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]"
            />
            Sync your listening history
          </li>
        </ul>

        <motion.button
          type="button"
          onClick={() => navigate("/connect-spotify")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1DB954] px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#1ed760] hover:shadow-[0_0_15px_rgba(29,185,84,0.4)]"
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
      className="glass rounded-2xl bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1DB954]/15">
          <Music size={21} className="text-[#1DB954]" />
        </div>

        <div>
          <h3 className="font-semibold text-white">Spotify Connected</h3>

          <p className="text-sm text-zinc-400">@{spotify.username}</p>
        </div>
      </div>

      {/* Followers */}
      <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
        <Users size={15} />
        <span>{formatCount(spotify.followers || 0)} followers</span>
      </div>

      {/* Spotify information */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Top Artists
          </p>

          <ul className="mt-2 space-y-1.5">
            {spotify.topArtists?.map((artist) => (
              <li key={artist} className="text-sm text-zinc-300">
                {artist}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Top Genres
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {spotify.topGenres?.map((genre) => (
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

      {/* Bottom actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <a
          href={`https://open.spotify.com/user/${spotify.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 transition-colors hover:text-green-300"
        >
          View Spotify Profile
          <ArrowUpRight size={15} />
        </a>

        <button
          type="button"
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Unlink size={14} />

          {disconnecting ? "Disconnecting..." : "Disconnect Spotify"}
        </button>
      </div>
    </motion.div>
  );
}
