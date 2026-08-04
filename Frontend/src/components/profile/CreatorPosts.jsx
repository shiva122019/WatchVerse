import { motion } from "framer-motion";
import { PlayCircle, Megaphone, Sparkles } from "lucide-react";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PostSection({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Icon size={16} className="text-red-500" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function CreatorPosts({ posts }) {
  return (
    <div className="space-y-8">
      <PostSection title="Trailers" icon={PlayCircle}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.trailers.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <PlayCircle size={32} className="text-zinc-500" />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-white">{post.title}</h4>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(post.date)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </PostSection>

      <PostSection title="Announcements" icon={Megaphone}>
        <div className="space-y-3">
          {posts.announcements.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <h4 className="font-medium text-white">{post.title}</h4>
              <p className="mt-1 text-xs text-zinc-500">{formatDate(post.date)}</p>
            </div>
          ))}
        </div>
      </PostSection>

      <PostSection title="Latest Releases" icon={Sparkles}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.latestReleases.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <h4 className="font-medium text-white">{post.title}</h4>
              <p className="mt-1 text-xs text-zinc-500">{formatDate(post.date)}</p>
            </div>
          ))}
        </div>
      </PostSection>
    </div>
  );
}
