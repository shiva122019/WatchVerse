import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

import SwipeStack from "@/components/SwipeStack";
import ProgressBar from "@/components/ProgressBar";

export default function Onboarding() {
  const navigate = useNavigate();

  const [content, setContent] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);

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

  async function finishOnboarding(finalLiked, finalDisliked) {
    try {
      setSubmitting(true);

      await api.post("/onboarding/preferences", {
        liked: finalLiked,
        disliked: finalDisliked,
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

    let updatedLiked = liked;
    let updatedDisliked = disliked;

    if (direction === "right") {
      updatedLiked = [
        ...liked,
        {
          id: item.id,
          mediaType: item.mediaType,
        },
      ];

      setLiked(updatedLiked);
    } else {
      updatedDisliked = [
        ...disliked,
        {
          id: item.id,
          mediaType: item.mediaType,
        },
      ];

      setDisliked(updatedDisliked);
    }

    setCurrentIndex(nextIndex);

    if (nextIndex >= content.length) {
      finishOnboarding(updatedLiked, updatedDisliked);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
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
      <div className="flex h-screen items-center justify-center text-xl">
        Saving your preferences...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <div className="px-8 pt-8">
        <h1 className="text-4xl font-bold">Get to Know You</h1>

        <p className="text-gray-400 mt-2">
          Swipe right if you'd watch it. Swipe left if you're not interested.
        </p>
      </div>

      <div className="px-8 mt-6">
        <ProgressBar current={currentIndex} total={content.length} />
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <SwipeStack
          cards={content}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
        />
      </div>

      <div className="pb-8 flex flex-col items-center gap-4">
        <div className="text-gray-500">
          {Math.min(currentIndex + 1, content.length)}
          {" / "}
          {content.length}
        </div>

        <button
          onClick={skipOnboarding}
          className="rounded-full border border-neutral-700 px-6 py-2 text-sm text-neutral-300 transition hover:border-white hover:text-white"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
