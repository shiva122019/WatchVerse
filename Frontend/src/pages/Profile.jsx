import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
 * Public user profile page.
 *
 * Currently backed by mock data (see ./data/mockProfile.js). Replace the
 * `profile` value below with a fetched response from GET /profile/me —
 * every component here expects the same shape, so no prop changes are
 * needed. See the notes at the bottom of the README/summary for details.
 */
export default function Profile() {
  const profile = mockProfile;
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-zinc-950 pb-20"
    >
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
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
                {profile.allReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}

            {activeTab === "Watchlist" && (
              <WatchlistTab watchlist={profile.watchlist} />
            )}

            {activeTab === "Activity" && (
              <ActivityTimeline groups={profile.activityTimeline} />
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
