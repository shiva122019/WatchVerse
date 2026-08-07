import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pencil, Settings, LayoutDashboard } from "lucide-react";

export default function ProfileActions({ role }) {
  const navigate = useNavigate();

  const buttons = [
    { key: "edit", label: "Edit Profile", icon: Pencil, to: "/profile/edit", variant: "primary" },
    { key: "settings", label: "Account Settings", icon: Settings, to: "/settings/account", variant: "secondary" },
    { key: "dashboard", label: "Creator Dashboard", icon: LayoutDashboard, to: "/studio", variant: "secondary" },
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-3 relative z-10">
      {buttons.map(({ key, label, icon: Icon, to, variant }) => (
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
      ))}
    </div>
  );
}
