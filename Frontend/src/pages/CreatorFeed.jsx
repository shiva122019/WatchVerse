import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Film, Music, Eye } from "lucide-react";
import api from "../lib/api";

export default function CreatorFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/creator/feed");
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Error fetching creator feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const minStr = m.toString().padStart(h > 0 ? 2 : 1, '0');
    const secStr = s.toString().padStart(2, '0');
    return h > 0 ? `${h}:${minStr}:${secStr}` : `${minStr}:${secStr}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-800 border-t-[#00F0FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8 lg:px-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Creators Hub</h1>
          <p className="mt-2 text-neutral-400">Discover original movies, shorts, and music from independent creators.</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Film className="mb-4 h-16 w-16 text-neutral-600" />
          <h2 className="text-xl font-semibold text-neutral-300">No content yet</h2>
          <p className="mt-2 text-neutral-500">Be the first to upload something amazing!</p>
          <Link to="/creator-studio" className="mt-6 rounded-full bg-[#00F0FF] px-6 py-2 font-semibold text-black transition-transform hover:scale-105">
            Go to Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/watch-creator/${post._id}`} className="group block h-full">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[#00F0FF]/20">
                  <img
                    src={post.thumbUrl || "https://placehold.co/600x338?text=Video"}
                    alt={post.title}
                    className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-[#00F0FF] p-4 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                      <Play className="h-6 w-6 fill-black text-black ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {post.duration > 0 && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-semibold tracking-wide text-white">
                      {formatDuration(post.duration)}
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium backdrop-blur-md border border-white/10 flex items-center gap-1 text-neutral-300">
                    {post.type === "movie" ? <Film className="w-3 h-3 text-[#00F0FF]" /> : <Music className="w-3 h-3 text-[#00F0FF]" />}
                    <span className="capitalize">{post.format || post.type}</span>
                  </div>
                </div>

                <div className="mt-4 px-1">
                  <h3 className="line-clamp-2 text-lg font-semibold text-neutral-200 transition-colors group-hover:text-[#00F0FF]">
                    {post.title}
                  </h3>
                  
                  <div className="mt-2 flex items-center justify-between text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                      <img 
                        src={post.userId?.profilePic || "https://placehold.co/100x100"} 
                        alt="creator" 
                        className="h-6 w-6 rounded-full border border-white/20 object-cover"
                      />
                      <span className="truncate max-w-[120px]">{post.userId?.username || "Creator"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Eye className="h-4 w-4" />
                      <span>{post.views?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
