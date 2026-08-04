import { motion } from "framer-motion";

const BASE_TABS = ["Overview", "Reviews", "Watchlist", "Activity", "Favorites"];

export default function ProfileTabs({ activeTab, onChange, role }) {
  const tabs = role === "creator" ? [...BASE_TABS, "Posts"] : BASE_TABS;

  return (
    <div className="mt-10 border-b border-zinc-800">
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-red-600"
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
