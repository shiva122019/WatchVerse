import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Settings,
  LayoutDashboard,
  PlayCircle,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ProfileActions({
  role,
  isOwnProfile,
  onViewContent,
  profileUsername,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(!isOwnProfile);

  useEffect(() => {
    if (isOwnProfile || !user || !profileUsername) return;

    let isMounted = true;
    api
      .get(`/followers/${profileUsername}`)
      .then((res) => {
        if (isMounted) {
          const followers = res.data.followers || [];
          setIsFollowing(followers.some((f) => f.username === user.username));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOwnProfile, user, profileUsername]);

  const toggleFollow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isFollowing) {
        await api.delete(`/follow/${profileUsername}`);
        setIsFollowing(false);
        toast.success(`Unfollowed @${profileUsername}`);
      } else {
        await api.post(`/follow/${profileUsername}`);
        setIsFollowing(true);
        toast.success(`Following @${profileUsername}`);
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    }
  };

  const buttons = [
    {
      key: "edit",
      label: "Edit Profile",
      icon: Pencil,
      to: "/profile/edit",
      variant: "primary",
    },

    {
      key: "dashboard",
      label: "Creator Dashboard",
      icon: LayoutDashboard,
      to: "/studio",
      variant: "secondary",
    },
    ,
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-3 relative z-10">
      {isOwnProfile ? (
        buttons.map(({ key, label, icon: Icon, to, variant }) => (
          <motion.button
            key={key}
            type="button"
            onClick={() => navigate(to)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={
              variant === "primary"
                ? "inline-flex items-center gap-2 rounded-full bg-[#00F0FF] px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-[#00F0FF]/15 transition-all hover:bg-[#00F0FF]/85 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                : "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-neutral-300 transition-all hover:border-[#00F0FF]/40 hover:bg-white/10 hover:text-white"
            }
          >
            <Icon size={16} />
            {label}
          </motion.button>
        ))
      ) : (
        <>
          <motion.button
            type="button"
            onClick={toggleFollow}
            disabled={loading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-all ${
              isFollowing
                ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                : "bg-[#00F0FF] text-black shadow-[#00F0FF]/15 hover:bg-[#00F0FF]/85 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isFollowing ? (
              "Following"
            ) : (
              "Follow"
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={onViewContent}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-neutral-300 transition-all hover:border-[#00F0FF]/40 hover:bg-white/10 hover:text-white"
          >
            <PlayCircle size={16} />
            View Content
          </motion.button>
        </>
      )}
    </div>
  );
}
