import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Link as LinkIcon, Calendar, Clapperboard, Pencil } from "lucide-react";
import FollowListModal from "./FollowListModal";
import UploadListModal from "./UploadListModal";

const ROLE_META = {
  creator: { label: "Creator", icon: Clapperboard },
  reviewer: { label: "Reviewer", icon: Pencil },
  member: { label: "Movie Enthusiast", icon: Clapperboard },
};

function formatJoinDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ProfileHeader({ profile, onViewContent }) {
  const [modalType, setModalType] = useState(null); // 'followers' or 'following'

  const roleMeta = ROLE_META[profile.role] ?? ROLE_META.member;
  const RoleIcon = roleMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mt-16 sm:mt-20 px-1"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {profile.displayName}
            </h1>
            {profile.verified && (
              <span title="Verified" className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                <ShieldCheck size={20} strokeWidth={2.4} />
              </span>
            )}
          </div>
          <p className="mt-0.5 text-zinc-400">@{profile.username}</p>

          <div className="mt-2 text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <button onClick={() => setModalType("uploads")} className="hover:text-white hover:underline transition-all">
              {profile.stats?.totalPosts || 0} Uploads
            </button>
            <span className="text-neutral-500">•</span>
            <button onClick={() => setModalType("followers")} className="hover:text-white hover:underline transition-all">
              {profile.stats?.followers || 0} Followers
            </button>
            <span className="text-neutral-500">•</span>
            <button onClick={() => setModalType("following")} className="hover:text-white hover:underline transition-all">
              {profile.stats?.following || 0} Following
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3 py-1 text-xs font-medium text-[#00F0FF]">
              <RoleIcon size={13} />
              {roleMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
              <Calendar size={13} />
              Joined {formatJoinDate(profile.joinDate)}
            </span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300">{profile.bio}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400">
        {profile.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} />
            {profile.location}
          </span>
        )}
        {profile.website && (
          <span className="inline-flex items-center gap-1.5">
            <LinkIcon size={14} />
            <a
              href={
                profile.website.startsWith("http")
                  ? profile.website
                  : `https://${profile.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00F0FF] hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          </span>
        )}
      </div>

      <FollowListModal
        isOpen={modalType === "followers" || modalType === "following"}
        onClose={() => setModalType(null)}
        username={profile.username}
        type={modalType}
      />

      <UploadListModal
        isOpen={modalType === "uploads"}
        onClose={() => setModalType(null)}
        posts={profile.creatorPosts}
      />
    </motion.div>
  );
}
