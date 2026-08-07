import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Video, 
  BarChart3, 
  Users, 
  Clock, 
  Eye, 
  Upload,
  UserPlus,
  User,
  Film,
  Music,
} from "lucide-react";
import api from "@/lib/api";
import ContentTable from "@/components/studio/ContentTable";
import CreatePostModal from "@/components/studio/CreatePostModal";
import ViewsChart from "@/components/studio/ViewsChart";
import ChannelAnalyticsCard from "@/components/studio/ChannelAnalyticsCard";

export default function CreatorStudio() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [contentSubTab, setContentSubTab] = useState("movies");
  const [stats, setStats] = useState({ totalViews: 0, totalWatchTime: 0, totalPosts: 0, followers: 0, following: 0 });
  const [posts, setPosts] = useState({ movies: [], music: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    Promise.all([
      api.get("/creator/stats"),
      api.get("/creator/posts")
    ]).then(([statsRes, postsRes]) => {
      if (isMounted) {
        setStats(statsRes.data);
        setPosts(postsRes.data);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Failed to load studio data", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  const handlePostCreated = (newPost) => {
    const key = newPost.type === "music" ? "music" : "movies";
    setPosts(prev => ({
      ...prev,
      [key]: [{
        id: newPost._id,
        title: newPost.title,
        thumbUrl: newPost.thumbUrl,
        date: newPost.createdAt,
        views: newPost.views || 0,
        watchTime: newPost.watchTime || 0
      }, ...(prev[key] || [])]
    }));
    setStats(prev => ({ ...prev, totalPosts: prev.totalPosts + 1 }));
  };

  const handlePostDeleted = (category, id) => {
    setPosts(prev => ({
      ...prev,
      [category]: prev[category].filter(p => p.id !== id)
    }));
    setStats(prev => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
  };

  const formatWatchTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const allPosts = [
    ...(posts.movies || []),
    ...(posts.music || [])
  ];
  const topContent = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const recentContent = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20 bg-neutral-950">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-[#00F0FF] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl pt-20 bg-neutral-950">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 p-6 hidden md:block bg-black/20 backdrop-blur-3xl">
        <div className="mb-10 px-4">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase opacity-90">Studio</h2>
        </div>
        
        <nav className="space-y-3">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "content", icon: Video, label: "Content" },
            { id: "analytics", icon: BarChart3, label: "Analytics" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#00F0FF]/10 to-transparent border border-[#00F0FF]/20 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.05)]"
                  : "border border-transparent text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className={`h-5 w-5 transition-transform duration-300 ${activeTab === tab.id ? "scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "group-hover:scale-110"}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#00F0FF]/5 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-[#FFB300]/5 blur-[100px]" />
        
        {/* Header Actions */}
        <div className="mb-10 flex items-center justify-between relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight capitalize">
            {activeTab}
          </h1>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#00c3ff] px-6 py-3 font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
          >
            <Upload className="h-5 w-5" />
            Create
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10"
          >
            {activeTab === "dashboard" && (
              <div className="space-y-10">
                {/* Analytics Overview */}
                <div>
                  <h3 className="mb-6 text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    <BarChart3 className="text-[#00F0FF]" size={20} />
                    Channel Analytics
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[480px] rounded-3xl border border-white/5 bg-white/[0.02] p-2 backdrop-blur-md shadow-2xl">
                      <ViewsChart data={stats.viewsTimeSeries} />
                    </div>
                    <div className="lg:col-span-1 rounded-3xl border border-white/5 bg-white/[0.02] p-2 backdrop-blur-md shadow-2xl">
                      <ChannelAnalyticsCard stats={stats} onNavigate={setActiveTab} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                  
                  {/* Left Side: 60% Width (col-span-3) */}
                  <div className="lg:col-span-3 space-y-8">
                    <h3 className="font-display text-2xl font-bold text-white tracking-wide">Key Metrics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                      <motion.div whileHover={{ y: -6, scale: 1.02 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] p-6 shadow-xl backdrop-blur-md">
                        <div className="absolute inset-0 bg-[#00F0FF]/0 transition-colors group-hover:bg-[#00F0FF]/5" />
                        <Users size={22} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                        <div className="mt-4 text-2xl font-bold text-white tracking-tight">{stats.followers?.toLocaleString() || "0"}</div>
                        <div className="mt-1 text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">Followers</div>
                      </motion.div>
                      
                      <motion.div whileHover={{ y: -6, scale: 1.02 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] p-6 shadow-xl backdrop-blur-md">
                        <div className="absolute inset-0 bg-[#00F0FF]/0 transition-colors group-hover:bg-[#00F0FF]/5" />
                        <UserPlus size={22} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                        <div className="mt-4 text-2xl font-bold text-white tracking-tight">{stats.following?.toLocaleString() || "0"}</div>
                        <div className="mt-1 text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">Following</div>
                      </motion.div>

                      <motion.div whileHover={{ y: -6, scale: 1.02 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] p-6 shadow-xl backdrop-blur-md">
                        <div className="absolute inset-0 bg-[#00F0FF]/0 transition-colors group-hover:bg-[#00F0FF]/5" />
                        <Eye size={22} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                        <div className="mt-4 text-2xl font-bold text-white tracking-tight">{stats.totalViews?.toLocaleString() || "0"}</div>
                        <div className="mt-1 text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">Total Views</div>
                      </motion.div>

                      <motion.div whileHover={{ y: -6, scale: 1.02 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] p-6 shadow-xl backdrop-blur-md">
                        <div className="absolute inset-0 bg-[#00F0FF]/0 transition-colors group-hover:bg-[#00F0FF]/5" />
                        <Clock size={22} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                        <div className="mt-4 text-2xl font-bold text-white tracking-tight">{formatWatchTime(stats.totalWatchTime)}</div>
                        <div className="mt-1 text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">Watch Time</div>
                      </motion.div>

                      <motion.div whileHover={{ y: -6, scale: 1.02 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] p-6 shadow-xl backdrop-blur-md sm:col-span-2">
                        <div className="absolute inset-0 bg-[#00F0FF]/0 transition-colors group-hover:bg-[#00F0FF]/5" />
                        <User size={22} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                        <div className="flex items-end gap-3 mt-4">
                          <div className="text-2xl font-bold text-white tracking-tight">{Math.floor((stats.totalViews || 0) * 0.7).toLocaleString()}</div>
                          <span className="text-xs font-bold text-[#00F0FF] mb-1.5 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">+12% this month</span>
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">Unique Viewers</div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Right Side: 40% Width (col-span-2) */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide mb-5">Top Content</h3>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-lg space-y-5">
                        {topContent.length === 0 ? (
                          <p className="text-sm text-neutral-500 text-center py-6 font-medium">No content yet</p>
                        ) : (
                          topContent.map((post) => (
                            <div key={post.id} className="group flex items-center gap-4 rounded-xl transition-all hover:bg-white/5 p-2 -mx-2">
                              <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 shadow-md">
                                {post.thumbUrl ? (
                                  <img src={post.thumbUrl} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600 font-medium">No Img</div>
                                )}
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-semibold text-white group-hover:text-[#00F0FF] transition-colors">{post.title}</p>
                                <p className="text-xs font-medium text-neutral-500 mt-1 flex items-center gap-1.5">
                                  <Eye size={12} className="text-[#00F0FF]/70" />
                                  {post.views?.toLocaleString()} views
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide mb-5">Recently Posted</h3>
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-lg space-y-5">
                        {recentContent.length === 0 ? (
                          <p className="text-sm text-neutral-500 text-center py-6 font-medium">No content yet</p>
                        ) : (
                          recentContent.map((post) => (
                            <div key={post.id} className="group flex items-center gap-4 rounded-xl transition-all hover:bg-white/5 p-2 -mx-2">
                              <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 shadow-md">
                                {post.thumbUrl ? (
                                  <img src={post.thumbUrl} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600 font-medium">No Img</div>
                                )}
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-semibold text-white group-hover:text-[#00F0FF] transition-colors">{post.title}</p>
                                <p className="text-xs font-medium text-neutral-500 mt-1 flex items-center gap-1.5">
                                  <Clock size={12} className="text-[#00F0FF]/70" />
                                  {new Date(post.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Graph */}
                <div className="h-[480px] rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-lg">
                  <ViewsChart data={stats.viewsTimeSeries} />
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="space-y-8">
                {/* Horizontal Sub-tabs */}
                <div className="border-b border-white/10">
                  <div className="flex space-x-10 overflow-x-auto pb-px">
                    {[
                      { id: "movies", label: "Movies", icon: Film },
                      { id: "music", label: "Music", icon: Music }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setContentSubTab(tab.id)}
                        className={`group relative flex items-center gap-2 whitespace-nowrap pb-4 px-2 font-semibold text-sm transition-colors ${
                          contentSubTab === tab.id
                            ? "text-[#00F0FF]"
                            : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        <tab.icon size={16} className={contentSubTab === tab.id ? "drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" : ""} />
                        {tab.label}
                        {contentSubTab === tab.id && (
                          <motion.div 
                            layoutId="activeContentTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Tab Content */}
                <div className="pt-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-lg overflow-hidden">
                    <ContentTable 
                      posts={posts[contentSubTab] || []} 
                      category={contentSubTab} 
                      onPostDeleted={handlePostDeleted} 
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={handlePostCreated}
      />
    </div>
  );
}
