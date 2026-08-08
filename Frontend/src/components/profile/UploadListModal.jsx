import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Film, Music, PlayCircle } from "lucide-react";

export default function UploadListModal({ isOpen, onClose, posts }) {
  if (!isOpen || !posts) return null;

  const hasMovies = posts.movies && posts.movies.length > 0;
  const hasMusic = posts.music && posts.music.length > 0;
  const hasNoPosts = !hasMovies && !hasMusic;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 p-5">
              <h2 className="font-display text-xl font-bold capitalize text-white">
                Uploads
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {hasNoPosts ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No uploads available yet.
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {hasMovies && (
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <Film size={16} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                        Movies
                      </div>
                      <div className="flex flex-col gap-2">
                        {posts.movies.map((post) => (
                          <Link
                            key={post.id}
                            to={`/watch-creator/${post.id}`}
                            onClick={onClose}
                            className="group flex items-center gap-3 rounded-xl bg-white/5 p-2 transition-all hover:bg-white/10 hover:border-[#00F0FF]/30 border border-transparent"
                          >
                            <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800 flex items-center justify-center">
                              {post.thumbUrl ? (
                                <img src={post.thumbUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                              ) : (
                                <PlayCircle size={20} className="text-neutral-500" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="truncate font-medium text-white group-hover:text-[#00F0FF] transition-colors">{post.title}</h4>
                              <p className="text-xs text-neutral-500">{new Date(post.date).toLocaleDateString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasMusic && (
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <Music size={16} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                        Music
                      </div>
                      <div className="flex flex-col gap-2">
                        {posts.music.map((post) => (
                          <Link
                            key={post.id}
                            to={`/watch-creator/${post.id}`}
                            onClick={onClose}
                            className="group flex items-center gap-3 rounded-xl bg-white/5 p-2 transition-all hover:bg-white/10 hover:border-[#00F0FF]/30 border border-transparent"
                          >
                            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800 flex items-center justify-center">
                              {post.thumbUrl ? (
                                <img src={post.thumbUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                              ) : (
                                <Music size={20} className="text-neutral-500" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="truncate font-medium text-white group-hover:text-[#00F0FF] transition-colors">{post.title}</h4>
                              <p className="text-xs text-neutral-500">{new Date(post.date).toLocaleDateString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
