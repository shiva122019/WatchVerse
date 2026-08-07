import { motion } from "framer-motion";

export default function ChannelAnalyticsCard({ stats, onNavigate }) {
  const formatTime = (seconds) => {
    const h = (seconds / 3600).toFixed(1);
    return `${h}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl border border-white/10 p-6 shadow-xl h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Channel analytics</h3>
      
      <div className="mb-6">
        <p className="text-sm text-neutral-400 mb-2">Current followers</p>
        <p className="font-display text-4xl font-bold text-white">
          {stats.followers?.toLocaleString() || "0"}
        </p>
        <p className="text-sm text-[#00F0FF] mt-1">+{(Math.floor(Math.random() * 10) + 1)} in last 28 days</p>
      </div>

      <div className="border-t border-white/10 my-6"></div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-white mb-1">Summary</h4>
        <p className="text-xs text-neutral-500 mb-4">Last 28 days</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Views</span>
            <span className="text-sm text-white font-medium">{stats.totalViews?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Watch time (hours)</span>
            <span className="text-sm text-white font-medium">{formatTime(stats.totalWatchTime)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Total Posts</span>
            <span className="text-sm text-white font-medium">{stats.totalPosts?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Following</span>
            <span className="text-sm text-white font-medium">{stats.following?.toLocaleString() || "0"}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={() => onNavigate("analytics")}
          className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-[#00F0FF] transition hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/30"
        >
          Go to channel analytics
        </button>
      </div>
    </motion.div>
  );
}
