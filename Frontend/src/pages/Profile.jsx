import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/lib/api";

import ProfileBanner from "../components/profile/ProfileBanner";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileActions from "../components/profile/ProfileActions";
import ProfileTabs from "../components/profile/ProfileTabs";
import OverviewTab from "../components/profile/OverviewTab";
import ReviewCard from "../components/profile/ReviewCard";
import WatchlistTab from "../components/profile/WatchlistTab";
import ActivityTimeline from "../components/profile/ActivityTimeline";
import FavoritesTab from "../components/profile/FavoritesTab";
import CreatorPosts from "../components/profile/CreatorPosts";

import { mockProfile } from "../data/mockProfile";

/**
 * Public & Personal user profile page.
 *
 * Connected to GET /profile/me (for authenticated user profile) or GET /profile/:username.
 * Falls back to mockProfile if unauthenticated or endpoint fails during offline testing.
 */
export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const endpoint = username ? `/profile/${username}` : "/profile/me";

    api
      .get(endpoint)
      .then((res) => {
        if (isMounted && res.data) {
          setProfile(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile from API, falling back to mock:", err);
        if (isMounted) {
          setProfile(mockProfile);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00F0FF] border-t-transparent" />
          <p className="text-xs uppercase tracking-widest text-neutral-500">Loading Profile…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-screen pb-20 overflow-hidden"
    >
      {/* Background Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 z-0"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(0, 240, 255, 0.12), transparent 45%), radial-gradient(circle at 90% 80%, rgba(255, 0, 85, 0.08), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-6 md:px-10">
        <ProfileBanner
          bannerUrl={profile.bannerUrl}
          avatarUrl={profile.avatarUrl}
          displayName={profile.displayName}
        />

        <ProfileHeader profile={profile} />

        <ProfileStats stats={profile.stats} />

        <ProfileActions role={profile.role} />

        <ProfileTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          role={profile.role}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pt-6"
          >
            {activeTab === "Overview" && <OverviewTab profile={profile} />}

            {activeTab === "Reviews" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(profile.allReviews || []).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}

            {activeTab === "Watchlist" && (
              <WatchlistTab watchlist={profile.watchlist} />
            )}

            {activeTab === "Activity" && (
              <ActivityTimeline groups={profile.activityTimeline || []} />
            )}

            {activeTab === "Favorites" && <FavoritesTab profile={profile} />}

            {activeTab === "Posts" && profile.role === "creator" && (
              <CreatorPosts posts={profile.creatorPosts} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
