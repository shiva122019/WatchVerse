import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { StarRating, StarInput } from "@/components/StarRating";
import { useAuth } from "@/context/AuthContext";
import { Plus, Check, Play, Clock, Film, Tv, Music2 } from "lucide-react";
import { toast } from "sonner";

const typeIcon = { movie: Film, series: Tv, song: Music2 };

export default function Detail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchStatus, setWatchStatus] = useState(null); // want|watching|watched|null
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadAll = async () => {
    const [c, r] = await Promise.all([
      api.get(`/content/${id}`),
      api.get("/reviews", { params: { content_id: id } }),
    ]);
    setContent(c.data);
    setReviews(r.data);
    if (user) {
      try {
        const wl = await api.get("/watchlist");
        const mine = wl.data.find((w) => w.content_id === id);
        setWatchStatus(mine ? mine.status : null);
      } catch {}
      const mineReview = r.data.find((rv) => rv.user_id === user.id);
      if (mineReview) {
        setRating(mineReview.rating);
        setReviewText(mineReview.text);
      }
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const setStatus = async (status) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/watchlist", { content_id: id, status });
      setWatchStatus(status);
      toast.success(`Added to ${status.replace("_", " ")}`);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Failed");
    }
  };

  const removeFromList = async () => {
    try {
      await api.delete(`/watchlist/${id}`);
      setWatchStatus(null);
      toast.success("Removed from list");
    } catch {}
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return navigate("/login");
    if (rating < 1) return setError("Please select a rating.");
    if (reviewText.trim().length < 5)
      return setError("Review must be at least 5 characters.");
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        content_id: id,
        rating,
        text: reviewText.trim(),
      });
      toast.success("Review posted");
      await loadAll();
    } catch (e2) {
      setError(formatApiError(e2.response?.data?.detail) || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!content) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-neutral-500">
        Loading…
      </div>
    );
  }

  const Icon = typeIcon[content.type] || Film;

  return (
    <div data-testid="detail-page" className="pb-24">
      {/* Backdrop */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={content.backdrop_url || content.cover_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/30" />
      </div>

      <div className="mx-auto -mt-48 max-w-6xl px-6 md:px-10">
        <div className="relative flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <div className="w-40 shrink-0 sm:w-52 md:w-60">
            <div
              className={`overflow-hidden rounded-xl border border-white/10 shadow-2xl ${
                content.type === "song" ? "aspect-square" : "aspect-[2/3]"
              }`}
            >
              <img
                src={content.cover_url}
                alt={content.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Meta */}
          <div className="flex-1 pt-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-2.5 py-1">
                <Icon className="h-3 w-3 text-[#00F0FF]" />
                <span
                  className="label-caps text-cyan"
                  style={{ fontSize: "0.65rem" }}
                >
                  {content.type}
                </span>
              </span>
              <span className="font-mono-alt text-xs text-neutral-400">
                {content.release_year}
              </span>
              {content.duration && (
                <span className="flex items-center gap-1 font-mono-alt text-xs text-neutral-400">
                  <Clock className="h-3 w-3" />
                  {content.duration}
                </span>
              )}
              <span className="font-mono-alt text-xs text-neutral-500">
                {content.language}
              </span>
            </div>

            <h1
              className="font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              data-testid="detail-title"
            >
              {content.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating value={content.avg_rating} size={20} />
                <span className="font-mono-alt text-lg text-white" data-testid="detail-avg-rating">
                  {content.avg_rating > 0 ? content.avg_rating.toFixed(1) : "—"}
                </span>
                <span className="text-xs text-neutral-500">
                  ({content.review_count}{" "}
                  {content.review_count === 1 ? "review" : "reviews"})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {content.genres?.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-neutral-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-6 max-w-3xl leading-relaxed text-neutral-300">
              {content.description}
            </p>

            {content.creator && (
              <p className="mt-4 text-sm text-neutral-400">
                <span className="label-caps mr-2">
                  {content.type === "song" ? "Artist" : "Creator"}
                </span>
                <span className="text-white">{content.creator}</span>
              </p>
            )}
            {content.cast?.length > 0 && (
              <p className="mt-2 text-sm text-neutral-400">
                <span className="label-caps mr-2">Cast</span>
                <span className="text-neutral-300">{content.cast.join(", ")}</span>
              </p>
            )}

            {/* Watchlist buttons */}
            <div className="mt-8 flex flex-wrap gap-2">
              {["want", "watching", "watched"].map((s) => {
                const active = watchStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => (active ? removeFromList() : setStatus(s))}
                    data-testid={`watchlist-${s}-btn`}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-[#00F0FF] bg-[#00F0FF] text-black"
                        : "border-white/15 bg-white/5 text-white hover:border-white/40"
                    }`}
                  >
                    {active ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {s === "want"
                      ? "Want to Watch"
                      : s === "watching"
                        ? "Currently Watching"
                        : "Watched"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="divider-line mt-16" />

        {/* Reviews */}
        <section className="mt-12" data-testid="reviews-section">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
            Reviews
          </h2>

          {user ? (
            <form
              onSubmit={submitReview}
              className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              data-testid="review-form"
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
                data-testid="review-text-input"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {reviewText.length}/1000
                </span>
                {error && (
                  <span className="text-xs text-[#FF0055]" data-testid="review-error">
                    {error}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                data-testid="review-submit-btn"
                className="mt-4 rounded-full bg-[#00F0FF] px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {submitting ? "Posting…" : "Post Review"}
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

          <div className="mt-8 space-y-4" data-testid="reviews-list">
            {reviews.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-neutral-500">
                No reviews yet. Be the first to write one.
              </p>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
                  data-testid={`review-${r.id}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FFB300] font-bold text-black">
                        {r.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{r.username}</p>
                        <p className="font-mono-alt text-[10px] uppercase text-neutral-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StarRating value={r.rating} />
                  </div>
                  <p className="mt-2 leading-relaxed text-neutral-300">{r.text}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
