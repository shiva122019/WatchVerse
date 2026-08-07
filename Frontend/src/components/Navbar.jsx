// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { PrismoLogoMark, PrismoWordmark } from "@/components/PrismoLogo";
// import { useAuth } from "@/context/AuthContext";
// import { Search, LogOut } from "lucide-react";
// import { useState } from "react";

// const linkClass = ({ isActive }) =>
//   `text-sm font-medium tracking-wide transition-colors ${
//     isActive ? "text-white" : "text-neutral-400 hover:text-white"
//   }`;

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [q, setQ] = useState("");

//   const submitSearch = (e) => {
//     e.preventDefault();
//     if (q.trim()) navigate(`/browse?q=${encodeURIComponent(q.trim())}`);
//   };

//   return (
//     <header
//       data-testid="app-navbar"
//       className="glass sticky top-0 z-50 w-full"
//     >
//       <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
//         <Link
//           to="/"
//           data-testid="nav-logo-link"
//           className="flex items-center gap-3"
//         >
//           <PrismoLogoMark size={32} />
//           <PrismoWordmark className="hidden sm:block" />
//         </Link>

//         <nav className="hidden items-center gap-8 md:flex">
//           <NavLink to="/" end className={linkClass} data-testid="nav-home">
//             Discover
//           </NavLink>
//           <NavLink
//             to="/browse?type=movie"
//             className={linkClass}
//             data-testid="nav-movies"
//           >
//             Movies
//           </NavLink>
//           <NavLink
//             to="/browse?type=series"
//             className={linkClass}
//             data-testid="nav-series"
//           >
//             Series
//           </NavLink>
//           <NavLink
//             to="/browse?type=song"
//             className={linkClass}
//             data-testid="nav-songs"
//           >
//             Music
//           </NavLink>
//           {user && (
//             <NavLink
//               to="/watchlist"
//               className={linkClass}
//               data-testid="nav-watchlist"
//             >
//               My List
//             </NavLink>
//           )}
//         </nav>

//         <form
//           onSubmit={submitSearch}
//           className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 md:flex"
//         >
//           <Search className="h-4 w-4 text-neutral-500" />
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Search titles, creators..."
//             className="w-52 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
//             data-testid="nav-search-input"
//           />
//         </form>

//         <div className="flex items-center gap-3">
//           {user ? (
//             <>
//               <span
//                 className="hidden text-sm text-neutral-300 md:inline"
//                 data-testid="nav-username"
//               >
//                 {user.username}
//               </span>
//               <button
//                 onClick={() => {
//                   logout();
//                   navigate("/");
//                 }}
//                 data-testid="nav-logout-btn"
//                 className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 transition hover:border-[#FF0055]/60 hover:text-[#FF0055]"
//                 aria-label="Log out"
//               >
//                 <LogOut className="h-4 w-4" />
//               </button>
//             </>
//           ) : (
//             <>
//               <Link
//                 to="/login"
//                 data-testid="nav-login-btn"
//                 className="text-sm font-medium text-neutral-300 hover:text-white"
//               >
//                 Log in
//               </Link>
//               <Link
//                 to="/register"
//                 data-testid="nav-register-btn"
//                 className="rounded-full border border-[#00F0FF] px-4 py-1.5 text-sm font-semibold text-[#00F0FF] transition hover:bg-[#00F0FF] hover:text-black"
//               >
//                 Join
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { PrismoLogoMark, PrismoWordmark } from "@/components/PrismoLogo";
import { useAuth } from "@/context/AuthContext";
import { Search, LogOut, ChevronDown, User as UserIcon, Video, List, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";

const getLinkClass = (isActive) =>
  `text-sm font-medium tracking-wide transition-colors ${
    isActive ? "text-white" : "text-neutral-400 hover:text-white"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentType = searchParams.get("type");
  const [q, setQ] = useState("");
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/browse?q=${encodeURIComponent(q.trim())}`);
  };

  useEffect(() => {
    if (!user) return;

    async function loadStatus() {
      try {
        const res = await api.get("/onboarding/status");
        setOnboardingCompleted(res.data.onboardingCompleted);
      } catch (err) {
        console.error(err);
      }
    }

    loadStatus();
  }, [user]);
  return (
    <header data-testid="app-navbar" className="glass sticky top-0 z-50 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link
          to="/"
          data-testid="nav-logo-link"
          className="flex items-center gap-3"
        >
          <PrismoLogoMark size={32} />
          <PrismoWordmark className="hidden sm:block" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) => getLinkClass(isActive)}
            data-testid="nav-home"
          >
            Discover
          </NavLink>
          <NavLink
            to="/browse?type=movie"
            className={({ isActive }) => getLinkClass(isActive && currentType === "movie")}
            data-testid="nav-movies"
          >
            Movies
          </NavLink>
          <NavLink
            to="/browse?type=series"
            className={({ isActive }) => getLinkClass(isActive && currentType === "series")}
            data-testid="nav-series"
          >
            Series
          </NavLink>
          <NavLink
            to="/browse?type=song"
            className={({ isActive }) => getLinkClass(isActive && currentType === "song")}
            data-testid="nav-songs"
          >
            Music
          </NavLink>
          <NavLink
            to="/creator-feed"
            className={({ isActive }) => getLinkClass(isActive)}
            data-testid="nav-creator-feed"
          >
            Creators Hub
          </NavLink>
          <NavLink
            to="/watchparty"
            className={({ isActive }) => getLinkClass(isActive)}
            data-testid="nav-watchparty"
          >
            Watch Party
          </NavLink>


          {user && !onboardingCompleted && (
            <NavLink
              to="/onBoarding"
              className={({ isActive }) => getLinkClass(isActive)}
              data-testid="nav-onBoarding"
            >
              Get to Know you
            </NavLink>
          )}
        </nav>

        <form
          onSubmit={submitSearch}
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 md:flex"
        >
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, creators..."
            className="w-52 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            data-testid="nav-search-input"
          />
        </form>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                  data-testid="nav-username"
                >
                  {user.username}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#121212]/95 shadow-xl backdrop-blur-md">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/watchlist");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <List className="h-4 w-4" />
                      My List
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/studio");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <Video className="h-4 w-4" />
                      Studio
                    </button>
                    <div className="my-1 border-t border-white/10"></div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#FF0055] transition hover:bg-[#FF0055]/10"
                      data-testid="nav-logout-btn"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login-btn"
                className="text-sm font-medium text-neutral-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                data-testid="nav-register-btn"
                className="rounded-full border border-[#00F0FF] px-4 py-1.5 text-sm font-semibold text-[#00F0FF] transition hover:bg-[#00F0FF] hover:text-black"
              >
                Join
              </Link>
            </>
          )}

          {/* Hamburger Menu Button */}
          <button 
            className="md:hidden p-2 text-neutral-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      <div className={`md:hidden absolute top-[100%] left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-3xl border-b border-white/10 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen py-4 border-b' : 'max-h-0 border-b-0 py-0'}`}>
        <div className="flex flex-col px-6 space-y-6">
          {/* Main Links */}
          <nav className="flex flex-col space-y-4">
            <NavLink to="/" end className={({ isActive }) => getLinkClass(isActive)}>Discover</NavLink>
            <NavLink to="/browse?type=movie" className={({ isActive }) => getLinkClass(isActive && currentType === "movie")}>Movies</NavLink>
            <NavLink to="/browse?type=series" className={({ isActive }) => getLinkClass(isActive && currentType === "series")}>Series</NavLink>
            <NavLink to="/browse?type=song" className={({ isActive }) => getLinkClass(isActive && currentType === "song")}>Music</NavLink>
            <NavLink to="/creator-feed" className={({ isActive }) => getLinkClass(isActive)}>Creators Hub</NavLink>
            <NavLink to="/watchparty" className={({ isActive }) => getLinkClass(isActive)}>Watch Party</NavLink>
            {user && !onboardingCompleted && (
              <NavLink to="/onBoarding" className={({ isActive }) => getLinkClass(isActive)}>Get to Know you</NavLink>
            )}
          </nav>
          
          <div className="border-t border-white/10"></div>
          
          {/* Mobile Profile Actions */}
          {user ? (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FFB300] flex items-center justify-center font-bold text-black">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-white">{user.username}</span>
              </div>
              <button onClick={() => navigate("/profile")} className="flex items-center gap-3 text-sm font-medium text-neutral-300 hover:text-white">
                <UserIcon className="h-5 w-5" /> Profile
              </button>
              <button onClick={() => navigate("/watchlist")} className="flex items-center gap-3 text-sm font-medium text-neutral-300 hover:text-white">
                <List className="h-5 w-5" /> My List
              </button>
              <button onClick={() => navigate("/studio")} className="flex items-center gap-3 text-sm font-medium text-[#00F0FF]">
                <Video className="h-5 w-5" /> Creator Studio
              </button>
              <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-3 text-sm font-medium text-[#FF0055]">
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <Link to="/login" className="text-center rounded-full border border-white/20 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Log in</Link>
              <Link to="/register" className="text-center rounded-full border border-[#00F0FF] bg-[#00F0FF]/10 py-2.5 text-sm font-semibold text-[#00F0FF] transition hover:bg-[#00F0FF] hover:text-black">Join WatchVerse</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
