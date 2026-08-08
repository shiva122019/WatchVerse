import { motion } from "framer-motion";
import { Activity, Film, Tv, Music, MessageSquareText } from "lucide-react";
import SpotifyCard from "./SpotifyCard";
import MediaCarousel from "./MediaCarousel";
import ReviewCard from "./ReviewCard";

function SectionCard({ title, icon: Icon, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="glass rounded-2xl p-5 sm:p-6 shadow-xl"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Icon size={16} className="text-[#00F0FF] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
        {title}
      </div>
      {children}
    </motion.section>
  );
}

function activityLabel(entry) {
  if (entry.type === "rating") return `Rated ${entry.title} ${"★".repeat(entry.rating)}`;
  if (entry.type === "watchlist") return `Added ${entry.title} to Watchlist`;
  if (entry.type === "review") return `Reviewed ${entry.title}`;
  return entry.title;
}

export default function OverviewTab({ profile }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 relative z-10">
      <SectionCard title="Recent Activity" icon={Activity}>
        <ul className="space-y-2.5">
          {profile.recentActivity.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5 text-sm text-neutral-300 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              {activityLabel(entry)}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SpotifyCard spotify={profile.spotify} />

      <div className="lg:col-span-2 grid grid-cols-1 gap-5 md:grid-cols-3">
        <SectionCard title="Favorite Movies" icon={Film}>
          <MediaCarousel items={profile.favoriteMovies} />
        </SectionCard>

        <SectionCard title="Favorite Webseries" icon={Tv}>
          <MediaCarousel items={profile.favoriteShows} />
        </SectionCard>

        <SectionCard title="Favorite Music" icon={Music}>
          <MediaCarousel items={profile.favoriteMusic} />
        </SectionCard>
      </div>

      <div className="lg:col-span-2">
        <SectionCard title="Recent Reviews" icon={MessageSquareText}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {profile.recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
