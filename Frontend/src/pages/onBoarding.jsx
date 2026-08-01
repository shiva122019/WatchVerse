import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

import SwipeStack from "@/components/SwipeStack";
import ProgressBar from "@/components/ProgressBar";

export default function Onboarding() {
  const navigate = useNavigate();

  const [content, setContent] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [superLiked, setSuperLiked] = useState([]);
  const [skipped, setSkipped] = useState([]);

  // Track the action type for each swipe (for progress bar coloring)
  const [actions, setActions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await api.get("/onboarding/content");

        setContent(res.data.content || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load onboarding.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  async function finishOnboarding(finalLiked, finalDisliked, finalSuperLiked) {
    try {
      setSubmitting(true);

      await api.post("/onboarding/preferences", {
        liked: finalLiked,
        disliked: finalDisliked,
        superLiked: finalSuperLiked,
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save preferences.");
      setSubmitting(false);
    }
  }

  function skipOnboarding() {
    navigate("/");
  }

  function handleSwipe(direction, item) {
    const nextIndex = currentIndex + 1;
    const payload = { id: item.id, mediaType: item.mediaType };

    let updatedLiked = liked;
    let updatedDisliked = disliked;
    let updatedSuperLiked = superLiked;

    if (direction === "right") {
      updatedLiked = [...liked, payload];
      setLiked(updatedLiked);
    } else if (direction === "left") {
      updatedDisliked = [...disliked, payload];
      setDisliked(updatedDisliked);
    } else if (direction === "superlike") {
      updatedSuperLiked = [...superLiked, payload];
      setSuperLiked(updatedSuperLiked);
    } else if (direction === "up") {
      // Skipped — no weight, just track it
      setSkipped([...skipped, payload]);
    }

    setActions((prev) => [...prev, direction]);
    setCurrentIndex(nextIndex);

    if (nextIndex >= content.length) {
      finishOnboarding(updatedLiked, updatedDisliked, updatedSuperLiked);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-10 h-10 rounded-full border-[3px] border-neutral-700 border-t-cyan-400"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 text-lg">
        {error}
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-10 h-10 rounded-full border-[3px] border-neutral-700 border-t-emerald-400"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-300 text-lg font-display"
        >
          Crafting your taste profile…
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* ── Header ── */}
      <div className="px-6 sm:px-8 pt-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold font-display"
        >
          What's Your Taste?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mt-2 text-sm sm:text-base max-w-md"
        >
          Swipe through and tell us what you think. We'll personalize your
          experience based on your picks.
        </motion.p>
      </div>

      {/* ── Progress ── */}
      <div className="px-6 sm:px-8 mt-5">
        <ProgressBar
          current={currentIndex}
          total={content.length}
          actions={actions}
        />
      </div>

      {/* ── Swipe Area ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <SwipeStack
          cards={content}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
        />
      </div>

      {/* ── Footer ── */}
      <div className="pb-6 flex flex-col items-center gap-3">
        <div className="text-neutral-500 text-sm font-mono-alt">
          {Math.min(currentIndex + 1, content.length)}
          <span className="text-neutral-700"> / </span>
          {content.length}
        </div>

        <button
          onClick={skipOnboarding}
          className="rounded-full border border-neutral-700/60 px-6 py-2 text-xs uppercase tracking-[0.15em] text-neutral-400 transition-all hover:border-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/40"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
