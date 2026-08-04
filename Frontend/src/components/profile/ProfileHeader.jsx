import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Link as LinkIcon, Calendar, Clapperboard, Pencil } from "lucide-react";

const ROLE_META = {
  creator: { label: "Creator", icon: Clapperboard },
  reviewer: { label: "Reviewer", icon: Pencil },
  member: { label: "Movie Enthusiast", icon: Clapperboard },
};

function formatJoinDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ProfileHeader({ profile }) {
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
              <span title="Verified" className="text-red-500">
                <ShieldCheck size={20} strokeWidth={2.4} />
              </span>
            )}
          </div>
          <p className="mt-0.5 text-zinc-400">@{profile.username}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-600/30 bg-red-600/10 px-3 py-1 text-xs font-medium text-red-400">
              <RoleIcon size={13} />
              {roleMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
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
          <a
            href={`https://${profile.website}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-red-400"
          >
            <LinkIcon size={14} />
            {profile.website}
          </a>
        )}
      </div>
    </motion.div>
  );
}
