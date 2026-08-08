import { motion } from "framer-motion";

const BASE_TABS = ["Overview", "Reviews", "Activity", "Favorites"];

export default function ProfileTabs({ activeTab, onChange, role, hasPosts }) {
  const tabs = role === "creator" || hasPosts ? [...BASE_TABS, "Posts"] : BASE_TABS;

  return (
    <div className="mt-10 border-b border-white/10 relative z-10">
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
