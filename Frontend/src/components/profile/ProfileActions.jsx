import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pencil, Settings, LayoutDashboard } from "lucide-react";

export default function ProfileActions({ role }) {
  const navigate = useNavigate();

  const buttons = [
    { key: "edit", label: "Edit Profile", icon: Pencil, to: "/profile/edit", variant: "primary" },
    { key: "settings", label: "Account Settings", icon: Settings, to: "/settings/account", variant: "secondary" },
    ...(role === "creator"
      ? [{ key: "dashboard", label: "Creator Dashboard", icon: LayoutDashboard, to: "/creator/dashboard", variant: "secondary" }]
      : []),
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {buttons.map(({ key, label, icon: Icon, to, variant }) => (
        <motion.button
          key={key}
          type="button"
          onClick={() => navigate(to)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className={
            variant === "primary"
              ? "inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-colors hover:bg-red-500"
              : "inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
          }
        >
          <Icon size={16} />
          {label}
        </motion.button>
      ))}
    </div>
  );
}
