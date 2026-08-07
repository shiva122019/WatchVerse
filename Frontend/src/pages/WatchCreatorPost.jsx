import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Clock, User } from "lucide-react";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { StarRating, StarInput } from "@/components/StarRating";
import ReviewComments from "@/components/ReviewComments";

export default function WatchCreatorPost() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mediaRef = useRef(null);
  const [viewCounted, setViewCounted] = useState(false);
  
  // Community Section States
  const [activeTab, setActiveTab] = useState("reviews"); // 'reviews' | 'comments'
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const fetchPostAndReviews = async () => {
    try {
      const [postRes, reviewsRes] = await Promise.all([
        api.get(`/creator/posts/${id}`),
        api.get("/reviews", { params: { content_id: id } })
      ]);
      setPost(postRes.data.post);
      setReviews(reviewsRes.data);
      
      // Auto-fill user's own review if it exists
      if (user && reviewsRes.data) {
        const mine = reviewsRes.data.find((r) => r.username === user.username);
        if (mine) {
          setRating(mine.rating);
          setReviewText(mine.text);
        }
      }
    } catch (err) {
      setError("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  // Track watch time every 5 seconds while playing
  useEffect(() => {
    let interval;
    const media = mediaRef.current;
    
    const handleTimeUpdate = () => {
      // Basic watch time increment logic (this can be optimized for production)
    };

    if (media) {
      media.addEventListener("timeupdate", handleTimeUpdate);
    }
    return () => {
      if (media) media.removeEventListener("timeupdate", handleTimeUpdate);
      clearInterval(interval);
    };
  }, []);

  const handlePlay = async () => {
    if (viewCounted) return;
    try {
      await api.post(`/creator/posts/${id}/view`, { watchTime: 0 });
      setViewCounted(true);
    } catch (err) {
      console.error("Failed to record view", err);
    }
  };

  const handlePause = async () => {
    if (!mediaRef.current) return;
    try {
      await api.post(`/creator/posts/${id}/view`, { watchTime: 10 });
    } catch (err) {
      console.error("Failed to record watch time", err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!user) return toast.error("Please login to review");
    if (rating < 1) return setReviewError("Please select a rating.");
    if (reviewText.trim().length < 5) return setReviewError("Review must be at least 5 characters.");
    
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        content_id: id,
        rating,
        text: reviewText.trim(),
      });
      toast.success("Review posted");
      await fetchPostAndReviews();
    } catch (e2) {
      setReviewError(formatApiError(e2.response?.data?.error) || "Failed to submit");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-800 border-t-[#00F0FF]"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white">
        <h2 className="text-2xl font-bold">{error || "Post not found"}</h2>
        <Link to="/creator-feed" className="mt-4 text-[#00F0FF] hover:underline">Return to Feed</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Navbar/Back button */}
      <div className="border-b border-white/10 bg-black/50 p-4 backdrop-blur-md">
        <Link to="/creator-feed" className="flex w-fit items-center gap-2 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Feed</span>
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Media Player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_40px_rgba(0,240,255,0.1)] border border-white/5">
          {post.type === "movie" ? (
            <video
              ref={mediaRef}
              src={post.videoUrl}
              poster={post.thumbUrl}
              controls
              onPlay={handlePlay}
              onPause={handlePause}
              className="h-full w-full outline-none"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-900 bg-cover bg-center" style={{ backgroundImage: `url(${post.thumbUrl})` }}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
              <div className="z-10 w-full max-w-xl p-8">
                <img src={post.thumbUrl} alt="cover" className="mx-auto mb-8 h-48 w-48 rounded-2xl shadow-2xl" />
                <audio
                  ref={mediaRef}
                  src={post.audioUrl}
                  controls
                  onPlay={handlePlay}
                  onPause={handlePause}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Post Details */}
        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-400">
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                <Eye className="h-4 w-4 text-[#00F0FF]" />
                <span className="font-medium text-white">{post.views?.toLocaleString() || 0} views</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                <span className="text-[#00F0FF] font-semibold text-xs uppercase tracking-wider">{post.format || post.type}</span>
              </div>
              {post.category && post.category.map(cat => (
                <div key={cat} className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10 capitalize">
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Creator Profile Card */}
          <Link to={`/profile/${post.userId?.username}`} className="group flex w-full md:w-72 shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10 hover:border-[#00F0FF]/40">
            <img 
              src={post.userId?.profilePic || "https://placehold.co/100x100"} 
              alt="creator" 
              className="h-14 w-14 rounded-full border-2 border-[#00F0FF]/30 object-cover group-hover:border-[#00F0FF] transition-colors"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Creator</p>
              <p className="text-lg font-medium text-white group-hover:text-[#00F0FF] transition-colors">{post.userId?.username}</p>
            </div>
          </Link>
        </div>

        <div className="divider-line mt-12" />

        {/* Community Section */}
        <section className="mt-8" data-testid="reviews-section">
          <div className="flex gap-8 border-b border-white/10 pb-4 mb-6">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`font-display text-2xl font-semibold tracking-tight transition ${activeTab === "reviews" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`font-display text-2xl font-semibold tracking-tight transition ${activeTab === "comments" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              Comments
            </button>
          </div>

          {activeTab === "reviews" ? (
            <>
              {user ? (
                <form
                  onSubmit={submitReview}
                  className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <p className="label-caps mb-3">Your rating</p>
                  <StarInput value={rating} onChange={setRating} />
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="Share your thoughts…"
                    className="mt-4 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#00F0FF]/50 focus:outline-none"
                    maxLength={1000}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      {reviewText.length}/1000
                    </span>
                    {reviewError && (
                      <span className="text-xs text-[#FF0055]">
                        {reviewError}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="mt-4 rounded-full bg-[#00F0FF] px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50"
                  >
                    {submittingReview ? "Posting…" : "Post Review"}
                  </button>
                </form>
              ) : (
                <p className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm text-neutral-400">
                  <Link to="/login" className="text-[#00F0FF] underline">
                    Log in
                  </Link>{" "}
                  to rate and review.
                </p>
              )}

              <div className="mt-8 space-y-4">
                {reviews.length === 0 ? (
                  <p className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-neutral-500">
                    No reviews yet. Be the first to write one.
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link to={`/profile/${r.username}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FFB300] font-bold text-black hover:opacity-80 transition-opacity">
                            {r.username?.charAt(0).toUpperCase()}
                          </Link>
                          <div>
                            <p className="font-medium text-white">
                              <Link to={`/profile/${r.username}`} className="hover:text-[#00F0FF] transition-colors">
                                {r.username}
                              </Link>
                            </p>
                            <p className="font-mono-alt text-[10px] uppercase text-neutral-500">
                              {new Date(r.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StarRating value={r.rating} />
                      </div>
                      <p className="mt-2 leading-relaxed text-neutral-300">
                        {r.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <ReviewComments contentId={id} />
          )}
        </section>

      </div>
    </div>
  );
}
