import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";
import { useRef, useState } from "react";
import api from "../../lib/api"; // Adjust to your api file

export default function ProfileBanner({ bannerUrl, avatarUrl, displayName }) {
  const [banner, setBanner] = useState(bannerUrl);
  const inputRef = useRef(null);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview immediately
    const preview = URL.createObjectURL(file);
    setBanner(preview);

    const formData = new FormData();
    formData.append("banner", file);

    try {
      const { data } = await api.post("/profile/banner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success && data.bannerUrl) {
        setBanner(data.bannerUrl);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload banner.");
      setBanner(bannerUrl);
    }

    e.target.value = "";
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-48 sm:h-60 overflow-hidden rounded-3xl">
        {banner ? (
          <img
            src={banner}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-[#00F0FF]/20 via-zinc-900 to-[#FF0055]/20" />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />

        <button
          type="button"
          onClick={handleClick}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-[#00F0FF]/60 hover:text-[#00F0FF]"
        >
          <Camera size={14} />
          <span className="hidden sm:inline">Change banner</span>
        </button>
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-12 left-6 sm:left-10">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-2xl border-4 border-black bg-[#111111] shadow-xl"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#00F0FF]/25 via-zinc-900 to-[#FF0055]/25 text-2xl font-bold text-white">
              {initials || <User size={32} />}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
