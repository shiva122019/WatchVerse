import { useState } from "react";
import { X, Upload, Loader2, Film, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

const MOVIE_GENRES = ["short film", "trailer", "series", "long film", "action", "comedy", "drama", "sci-fi"];
const MUSIC_GENRES = ["romantic", "pop", "hip hop", "classical", "lo-fi", "electronic", "rock"];

export default function CreatePostModal({ isOpen, onClose, onCreated }) {
  const [type, setType] = useState("movie"); // "movie" or "music"
  const [format, setFormat] = useState("full movie"); // "full movie", "short film", "trailer", "web series"
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [thumbFile, setThumbFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setType(newType);
    setSelectedCategories([]);
    setVideoFile(null);
    setAudioFile(null);
    setDuration(0);
  };

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const extractDuration = (file, isAudio) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const media = document.createElement(isAudio ? 'audio' : 'video');
    media.src = url;
    media.onloadedmetadata = () => {
      setDuration(media.duration);
      URL.revokeObjectURL(url);
    };
  };

  const handleMediaChange = (e, isAudio) => {
    const file = e.target.files[0];
    if (isAudio) {
      setAudioFile(file);
    } else {
      setVideoFile(file);
    }
    extractDuration(file, isAudio);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (selectedCategories.length === 0) return toast.error("Select at least one genre/category");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      if (type === "movie") formData.append("format", format);
      formData.append("title", title);
      selectedCategories.forEach(cat => formData.append("category", cat));
      
      if (thumbFile) formData.append("thumb", thumbFile);
      if (type === "movie" && videoFile) formData.append("media", videoFile);
      if (type === "music" && audioFile) formData.append("media", audioFile);
      
      formData.append("duration", duration);

      const res = await api.post("/creator/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Content uploaded successfully!");
      onCreated(res.data.post);
      onClose();
      // Reset form
      setTitle("");
      setThumbFile(null);
      setVideoFile(null);
      setAudioFile(null);
      setDuration(0);
      setSelectedCategories([]);
      setType("movie");
      setFormat("full movie");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const availableGenres = type === "movie" ? MOVIE_GENRES : MUSIC_GENRES;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm overflow-y-auto py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="border-b border-white/10 bg-white/5 p-6 flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-white">Upload New Content</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Type Selection */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-300">Content Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange("movie")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                    type === "movie" 
                      ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]" 
                      : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  <Film className="h-8 w-8" />
                  <span className="font-semibold">Movie / Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("music")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                    type === "music" 
                      ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF]" 
                      : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  <Music className="h-8 w-8" />
                  <span className="font-semibold">Music / Audio</span>
                </button>
              </div>
            </div>

            {/* Format Selection (Only for Movies) */}
            {type === "movie" && (
              <div>
                <label className="mb-3 block text-sm font-medium text-neutral-300">Movie Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["full movie", "short film", "trailer", "web series"].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                        format === f
                          ? "border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF]"
                          : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "movie" ? "e.g. Inception (Short Film)" : "e.g. Midnight Lo-Fi Beats"}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-neutral-500 focus:border-[#00F0FF] focus:outline-none focus:ring-1 focus:ring-[#00F0FF]"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-300">Genres & Categories (Select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleCategory(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      selectedCategories.includes(genre)
                        ? "border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF]"
                        : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Thumbnail Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbFile(e.target.files[0])}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#00F0FF]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#00F0FF] hover:file:bg-[#00F0FF]/20"
                />
              </div>

              {type === "movie" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-300">Video File</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleMediaChange(e, false)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#00F0FF]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#00F0FF] hover:file:bg-[#00F0FF]/20"
                    required
                  />
                  {duration > 0 && <p className="mt-1 text-xs text-neutral-400">Duration: {Math.round(duration)}s</p>}
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-300">Audio File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleMediaChange(e, true)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#00F0FF]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#00F0FF] hover:file:bg-[#00F0FF]/20"
                    required
                  />
                  {duration > 0 && <p className="mt-1 text-xs text-neutral-400">Duration: {Math.round(duration)}s</p>}
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-white/10 px-4 py-3 font-semibold text-neutral-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#00F0FF] px-4 py-3 font-semibold text-black transition hover:bg-[#00F0FF]/90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload Content
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
