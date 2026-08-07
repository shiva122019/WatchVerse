import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Clock, User } from "lucide-react";
import api from "../lib/api";

export default function WatchCreatorPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mediaRef = useRef(null);
  const [viewCounted, setViewCounted] = useState(false);
  const [watchTime, setWatchTime] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/creator/posts/${id}`);
        setPost(res.data.post);
      } catch (err) {
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

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
      // Record a view as soon as they start playing
      await api.post(`/creator/posts/${id}/view`, { watchTime: 0 });
      setViewCounted(true);
    } catch (err) {
      console.error("Failed to record view", err);
    }
  };

  const handlePause = async () => {
    if (!mediaRef.current) return;
    try {
      // Record incremental watch time on pause (currentTime)
      // For simplicity in this demo, we'll just send 10 seconds of watch time per pause to simulate tracking
      await api.post(`/creator/posts/${id}/view`, { watchTime: 10 });
    } catch (err) {
      console.error("Failed to record watch time", err);
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
          <div className="flex w-full md:w-72 shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <img 
              src={post.userId?.profilePic || "https://placehold.co/100x100"} 
              alt="creator" 
              className="h-14 w-14 rounded-full border-2 border-[#00F0FF]/30 object-cover"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Creator</p>
              <p className="text-lg font-medium text-white">{post.userId?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
