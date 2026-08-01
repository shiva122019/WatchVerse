import { useState, useEffect } from "react";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Send, Trash2, Edit2, X, CornerDownRight } from "lucide-react";
import { toast } from "sonner";

export default function ReviewComments({ contentId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { id, username }
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/comments", { params: { content_id: contentId } });
      setComments(res.data);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await api.post("/comments", {
        content_id: contentId,
        text: newComment,
        parent_id: replyingTo ? replyingTo.id : null,
      });
      toast.success("Comment posted");
      setNewComment("");
      setReplyingTo(null);
      await loadComments();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.error) || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/comments/${id}`);
      toast.success("Comment deleted");
      await loadComments();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.error) || "Failed to delete comment");
    }
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      await api.patch(`/comments/${id}`, { text: editText });
      toast.success("Comment updated");
      setEditingId(null);
      await loadComments();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.error) || "Failed to update comment");
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.text);
  };

  // Recursive render for replies
  const renderComment = (c, isReply = false) => {
    return (
      <div key={c.id} className={`flex flex-col gap-2 ${isReply ? "ml-8 mt-3" : "mt-4"}`}>
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FFB300] text-xs font-bold text-black">
            {c.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 rounded-xl bg-white/[0.02] p-3 text-sm border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white">{c.username || "Unknown"}</span>
              <span className="text-xs text-neutral-500">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {editingId === c.id ? (
              <form onSubmit={(e) => handleEditSubmit(e, c.id)} className="mt-2">
                <input 
                  type="text" 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)} 
                  className="w-full rounded-md border border-white/10 bg-black/40 p-2 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none"
                  autoFocus
                />
                <div className="mt-2 flex gap-2">
                  <button type="submit" className="text-xs text-[#00F0FF] hover:underline">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-neutral-400 hover:underline">Cancel</button>
                </div>
              </form>
            ) : (
              <p className={`text-neutral-300 ${c.is_deleted ? "italic text-neutral-500" : ""}`}>
                {c.text}
              </p>
            )}
            
            {!c.is_deleted && user && (
              <div className="mt-2 flex gap-3 text-xs text-neutral-500">
                {!isReply && (
                  <button onClick={() => setReplyingTo({ id: c.id, username: c.username })} className="hover:text-white flex items-center gap-1 transition">
                    <CornerDownRight className="w-3 h-3" /> Reply
                  </button>
                )}
                {user.id === c.user_id && (
                  <>
                    <button onClick={() => startEdit(c)} className="hover:text-white flex items-center gap-1 transition">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="hover:text-[#FF0055] flex items-center gap-1 transition">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {c.replies && c.replies.length > 0 && (
          <div className="flex flex-col gap-1">
            {c.replies.map(r => renderComment(r, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
      {user ? (
            <div className="mb-6">
              {replyingTo && (
                <div className="mb-2 flex items-center gap-2 text-xs text-neutral-400">
                  <span>Replying to <strong className="text-white">@{replyingTo.username}</strong></span>
                  <button onClick={() => setReplyingTo(null)} className="hover:text-white transition">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[#00F0FF]/50 focus:outline-none transition"
                  maxLength={500}
                />
                <button 
                  type="submit" 
                  disabled={submitting || !newComment.trim()}
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#00F0FF] text-black transition hover:brightness-110 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <p className="mb-6 text-xs text-neutral-500">Please log in to comment.</p>
          )}

          {loading ? (
            <div className="text-center text-xs text-neutral-500 py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-xs text-neutral-500 py-4">No comments yet. Be the first to start the conversation!</div>
          ) : (
            <div className="flex flex-col gap-1">
              {comments.map(c => renderComment(c))}
            </div>
          )}
    </div>
  );
}
