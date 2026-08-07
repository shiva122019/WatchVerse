import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Video, 
  BarChart3, 
  Users, 
  Clock, 
  Eye, 
  Upload,
  Plus,
  UserPlus,
  User,
  Film,
  Music,
  Play
} from "lucide-react";
import api from "@/lib/api";
import ContentTable from "@/components/studio/ContentTable";
import CreatePostModal from "@/components/studio/CreatePostModal";
import ViewsChart from "@/components/studio/ViewsChart";
import ChannelAnalyticsCard from "@/components/studio/ChannelAnalyticsCard";

export default function CreatorStudio() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [contentSubTab, setContentSubTab] = useState("fullMovies");
  const [stats, setStats] = useState({ totalViews: 0, totalWatchTime: 0, totalPosts: 0, followers: 0, following: 0 });
  const [posts, setPosts] = useState({ fullMovies: [], shortMovies: [], trailers: [], webSeries: [], music: [] });
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
    // Determine which category array to push into based on DB category value
    const categoryKeyMap = {
      trailer: "trailers",
      announcement: "announcements",
      latestRelease: "latestReleases",
    };
    
    const key = categoryKeyMap[newPost.category];
    if (key) {
      setPosts(prev => ({
        ...prev,
        [key]: [{
          id: newPost._id,
          title: newPost.title,
          thumbUrl: newPost.thumbUrl,
          date: newPost.createdAt,
          views: newPost.views || 0,
          watchTime: newPost.watchTime || 0
        }, ...prev[key]]
      }));
      setStats(prev => ({ ...prev, totalPosts: prev.totalPosts + 1 }));
    }
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
    ...(posts.fullMovies || []),
    ...(posts.shortMovies || []),
    ...(posts.trailers || []),
    ...(posts.webSeries || []),
    ...(posts.music || [])
  ];
  const topContent = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const recentContent = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00F0FF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl pt-20">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:block">
        <div className="mb-8 px-4">
          <h2 className="font-display text-xl font-bold text-white tracking-wide">Studio</h2>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
              activeTab === "dashboard"
                ? "bg-[#00F0FF]/10 text-[#00F0FF]"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab("content")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
              activeTab === "content"
                ? "bg-[#00F0FF]/10 text-[#00F0FF]"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Video className="h-5 w-5" />
            Content
          </button>
          
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
              activeTab === "analytics"
                ? "bg-[#00F0FF]/10 text-[#00F0FF]"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10">
        
        {/* Header Actions */}
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-white capitalize">
            {activeTab}
          </h1>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#00F0FF] px-5 py-2.5 font-semibold text-black transition hover:bg-[#00F0FF]/90 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <Upload className="h-4 w-4" />
            Create
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Analytics Overview */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Channel Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 h-[450px]">
                    <ViewsChart data={stats.viewsTimeSeries} />
                  </div>
                  <div className="lg:col-span-1">
                    <ChannelAnalyticsCard stats={stats} onNavigate={setActiveTab} />
                  </div>
                </div>
              </div>
              
              {/* Recent Performance Snapshot could go here */}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Left Side: 60% Width (col-span-3) */}
                <div className="lg:col-span-3 space-y-6">
                  <h3 className="font-display text-xl font-bold text-white tracking-wide">Key Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ y: -4, borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)" }}
                      transition={{ duration: 0.2 }}
                      className="group glass rounded-2xl p-4 sm:p-5"
                    >
                      <Users size={18} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                      <div className="mt-3 text-xl sm:text-2xl font-bold text-white font-display">{stats.followers?.toLocaleString() || "0"}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 uppercase tracking-wider">Followers</div>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ y: -4, borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)" }}
                      transition={{ duration: 0.2 }}
                      className="group glass rounded-2xl p-4 sm:p-5"
                    >
                      <UserPlus size={18} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                      <div className="mt-3 text-xl sm:text-2xl font-bold text-white font-display">{stats.following?.toLocaleString() || "0"}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 uppercase tracking-wider">Following</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4, borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)" }}
                      transition={{ duration: 0.2 }}
                      className="group glass rounded-2xl p-4 sm:p-5"
                    >
                      <Eye size={18} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                      <div className="mt-3 text-xl sm:text-2xl font-bold text-white font-display">{stats.totalViews?.toLocaleString() || "0"}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 uppercase tracking-wider">Total Views</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4, borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)" }}
                      transition={{ duration: 0.2 }}
                      className="group glass rounded-2xl p-4 sm:p-5"
                    >
                      <Clock size={18} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                      <div className="mt-3 text-xl sm:text-2xl font-bold text-white font-display">{formatWatchTime(stats.totalWatchTime)}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 uppercase tracking-wider">Watch Time</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4, borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)" }}
                      transition={{ duration: 0.2 }}
                      className="group glass rounded-2xl p-4 sm:p-5 sm:col-span-2"
                    >
                      <User size={18} className="text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
                      <div className="flex items-end gap-3 mt-3">
                        <div className="text-xl sm:text-2xl font-bold text-white font-display">{Math.floor((stats.totalViews || 0) * 0.7).toLocaleString()}</div>
                        <span className="text-sm font-medium text-green-400 mb-1">+12% this month</span>
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500 uppercase tracking-wider">Unique Viewers</div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Right Side: 40% Width (col-span-2) */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white tracking-wide mb-4">Top Content</h3>
                    <div className="glass rounded-2xl border border-white/10 p-4 shadow-lg space-y-4">
                      {topContent.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center py-4">No content yet</p>
                      ) : (
                        topContent.map((post) => (
                          <div key={post.id} className="flex items-center gap-3">
                            <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-800">
                              {post.thumbUrl ? (
                                <img src={post.thumbUrl} alt={post.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">No Img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-white">{post.title}</p>
                              <p className="text-xs text-neutral-400">{post.views?.toLocaleString()} views</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-display text-xl font-bold text-white tracking-wide mb-4">Recently Posted</h3>
                    <div className="glass rounded-2xl border border-white/10 p-4 shadow-lg space-y-4">
                      {recentContent.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center py-4">No content yet</p>
                      ) : (
                        recentContent.map((post) => (
                          <div key={post.id} className="flex items-center gap-3">
                            <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-800">
                              {post.thumbUrl ? (
                                <img src={post.thumbUrl} alt={post.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">No Img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-white">{post.title}</p>
                              <p className="text-xs text-neutral-400">{new Date(post.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom: Graph */}
              <div className="h-[450px]">
                <ViewsChart data={stats.viewsTimeSeries} />
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Horizontal Sub-tabs */}
              <div className="border-b border-white/10">
                <div className="flex space-x-8 overflow-x-auto pb-px">
                  {[
                    { id: "fullMovies", label: "Full Movies" },
                    { id: "shortMovies", label: "Short Movies" },
                    { id: "trailers", label: "Trailers" },
                    { id: "webSeries", label: "Web Series" },
                    { id: "music", label: "Music" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setContentSubTab(tab.id)}
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        contentSubTab === tab.id
                          ? "border-[#00F0FF] text-[#00F0FF]"
                          : "border-transparent text-neutral-400 hover:text-white hover:border-neutral-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tab Content */}
              <div className="pt-4">
                <ContentTable 
                  posts={posts[contentSubTab] || []} 
                  category={contentSubTab} 
                  onPostDeleted={handlePostDeleted} 
                />
              </div>
            </div>
          )}
        </motion.div>
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
