import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, Play, Eye, Clock } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ContentTable({ posts, category, onPostDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-white/5 border-dashed bg-white/[0.02]">
        <p className="text-neutral-500">No {category} posted yet.</p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/creator/posts/${id}`);
      toast.success("Post deleted");
      onPostDeleted(category, id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const formatWatchTime = (seconds) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatMediaDuration = (seconds) => {
    if (!seconds) return "";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const minStr = m.toString().padStart(h > 0 ? 2 : 1, '0');
    const secStr = s.toString().padStart(2, '0');
    
    if (h > 0) return `${h}:${minStr}:${secStr}`;
    return `${minStr}:${secStr}`;
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm text-neutral-300">
        <thead className="border-b border-white/10 bg-white/5 uppercase text-neutral-400">
          <tr>
            <th className="px-6 py-4 font-medium">Content</th>
            <th className="px-6 py-4 font-medium text-center">Views</th>
            <th className="px-6 py-4 font-medium text-center">Watch Time</th>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {posts.map((post) => (
            <tr key={post.id} className="transition-colors hover:bg-white/5">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                    <img 
                      src={post.thumbUrl || "https://placehold.co/400x225?text=Video"} 
                      alt="" 
                      className="h-full w-full object-cover opacity-80" 
                    />
                    {post.duration > 0 && (
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-medium text-white tracking-wide">
                        {formatMediaDuration(post.duration)}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="font-medium text-white max-w-[250px] truncate">
                    {post.title}
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4 text-neutral-500" />
                  <span className="font-mono text-white">{post.views?.toLocaleString() || 0}</span>
                </div>
              </td>

              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-500" />
                  <span className="font-mono text-white">{formatWatchTime(post.watchTime)}</span>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
              </td>

              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="rounded-full p-2 text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
