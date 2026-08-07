import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, Play, Eye, Clock } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import EmptyState from "../ui/EmptyState";
import { Video } from "lucide-react";

export default function ContentTable({ posts, category, onPostDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  if (!posts || posts.length === 0) {
    return (
      <EmptyState 
        icon={Video} 
        title={`No ${category} posted yet.`} 
        minHeight="200px" 
      />
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
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      
      {/* MOBILE VIEW: Stacked Cards */}
      <div className="md:hidden flex flex-col divide-y divide-white/5">
        {posts.map((post) => (
          <div key={post.id} className="p-4 space-y-4 hover:bg-white/[0.02] transition-colors">
            {/* Header: Thumbnail + Title */}
            <div className="flex gap-4">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-900 shadow-md">
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
              <div className="flex flex-col justify-between">
                <div className="font-medium text-white line-clamp-2 leading-tight">
                  {post.title}
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex justify-between items-center rounded-xl bg-black/20 p-3">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Views</span>
                <div className="flex items-center gap-1.5 text-[#00F0FF]">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-mono text-sm font-bold">{post.views?.toLocaleString() || 0}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Watch Time</span>
                <div className="flex items-center gap-1.5 text-[#00F0FF]">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono text-sm font-bold">{formatWatchTime(post.watchTime)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button 
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Edit Post"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(post.id)}
                disabled={deletingId === post.id}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-[#FF0055]/20 hover:text-[#FF0055]"
                title="Delete Post"
              >
                <Trash2 className={`h-4 w-4 ${deletingId === post.id ? 'opacity-50' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: Traditional Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="border-b border-white/10 bg-white/5 uppercase text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wide text-xs">Content</th>
              <th className="px-6 py-4 font-medium tracking-wide text-xs text-center">Views</th>
              <th className="px-6 py-4 font-medium tracking-wide text-xs text-center">Watch Time</th>
              <th className="px-6 py-4 font-medium tracking-wide text-xs">Date</th>
              <th className="px-6 py-4 font-medium tracking-wide text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.map((post) => (
              <tr key={post.id} className="transition-colors hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-900 shadow-md group cursor-pointer">
                      <img 
                        src={post.thumbUrl || "https://placehold.co/400x225?text=Video"} 
                        alt="" 
                        className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition duration-500" 
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
                    <div className="font-medium text-white max-w-[250px] truncate group-hover:text-[#00F0FF] transition-colors cursor-pointer">
                      {post.title}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="h-4 w-4 text-[#00F0FF]/50" />
                    <span className="font-mono text-white font-medium">{post.views?.toLocaleString() || 0}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-[#00F0FF]/50" />
                    <span className="font-mono text-white font-medium">{formatWatchTime(post.watchTime)}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-neutral-400">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </td>
                
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white shadow-sm"
                      title="Edit Post"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-[#FF0055]/20 hover:text-[#FF0055] shadow-sm"
                      title="Delete Post"
                    >
                      <Trash2 className={`h-4 w-4 ${deletingId === post.id ? 'opacity-50' : ''}`} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
