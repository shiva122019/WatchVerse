import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, Sparkles, Disc, Radio, AlertCircle } from "lucide-react";
import { PrismoLogoMark } from "@/components/PrismoLogo";
import { API } from "@/lib/api";

export default function ConnectSpotify() {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");

  const handleConnectSpotify = () => {
    window.location.href = `${API}/auth/spotify`;
  };

  return (
    <div
      className="relative flex min-h-[90vh] items-center justify-center px-4 py-12"
      data-testid="connect-spotify-page"
    >
      {/* Background Ambient Glows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(29,185,84,0.25), transparent 60%), radial-gradient(circle at 80% 80%, rgba(0,240,255,0.1), transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass relative z-10 w-full max-w-lg rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 bg-gradient-to-b from-neutral-900/80 to-neutral-950/90 backdrop-blur-xl"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-black/40 border border-green-500/30 shadow-[0_0_30px_rgba(29,185,84,0.25)]">
            <PrismoLogoMark size={36} />
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-md">
              <Music size={16} />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-400">
            Step 1 of Setup
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Connect Your Spotify
          </h1>

          <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
            WatchVerse merges your film and music worlds. Link Spotify to unlock personalized soundtracks, music recommendations, and interactive karaoke.
          </p>
        </div>

        {/* Error Alert */}
        {errorParam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300"
          >
            <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Spotify Connection Failed</p>
              <p className="mt-0.5">{decodeURIComponent(errorParam)}</p>
            </div>
          </motion.div>
        )}

        {/* Feature Highlights */}
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Taste-Based Recommendations</h3>
              <p className="mt-0.5 text-xs text-neutral-400">
                Discover movies and shows matching the mood and aesthetic of your favorite tracks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <Disc size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">WatchParty & Karaoke Sync</h3>
              <p className="mt-0.5 text-xs text-neutral-400">
                Stream soundtracks live with friends and sing along in synchronized karaoke mode.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Profile Music Badges</h3>
              <p className="mt-0.5 text-xs text-neutral-400">
                Showcase your top artists and favorite genres on your public WatchVerse profile.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          type="button"
          onClick={handleConnectSpotify}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="connect-spotify-btn"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] py-3.5 text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_25px_rgba(29,185,84,0.4)] transition-all hover:shadow-[0_0_35px_rgba(29,185,84,0.6)]"
        >
          <Music size={18} />
          Connect Spotify
        </motion.button>

        <p className="mt-4 text-center text-xs text-neutral-500">
          You will be redirected to Spotify to grant read permissions. WatchVerse never stores your access tokens.
        </p>
      </motion.div>
    </div>
  );
}
