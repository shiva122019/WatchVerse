import { motion } from "framer-motion";
import { PlayCircle, Film, Music, Video, Clapperboard, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PostSection({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Icon size={16} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function CreatorPosts({ posts }) {
  if (!posts) return null;

  const sections = [
    { key: "movies", title: "Movies", icon: Film },
    { key: "music", title: "Music", icon: Music },
  ];

  return (
    <div className="space-y-8 relative z-10">
      {sections.map(({ key, title, icon }) => {
        const categoryPosts = posts[key] || [];
        if (categoryPosts.length === 0) return null;

        return (
          <PostSection key={key} title={title} icon={icon}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {categoryPosts.map((post, idx) => (
                <Link to={`/watch-creator/${post.id}`} key={post.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="group overflow-hidden rounded-2xl glass transition-all duration-300 shadow-md cursor-pointer hover:border-[#00F0FF]/30 h-full flex flex-col"
                  >
                    <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-neutral-800/80 to-neutral-900/60 overflow-hidden">
                      {post.thumbUrl ? (
                        <img src={post.thumbUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <PlayCircle size={32} className="text-neutral-500 transition duration-300 group-hover:scale-110 group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                      )}
                      
                      {/* Duration overlay if available */}
                      {post.duration > 0 && (
                        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                          {Math.floor(post.duration / 60)}:{(post.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-display font-medium text-white group-hover:text-[#00F0FF] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="mt-auto pt-2 flex items-center justify-between text-xs text-zinc-500">
                        <span>{formatDate(post.date)}</span>
                        <span>{post.views || 0} views</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </PostSection>
        );
      })}

      {(!posts.movies?.length && !posts.music?.length) && (
        <div className="py-12 text-center text-sm text-neutral-500">
          No posts available yet.
        </div>
      )}
    </div>
  );
}
