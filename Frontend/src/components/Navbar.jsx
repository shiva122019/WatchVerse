import { Link, NavLink, useNavigate } from "react-router-dom";
import { PrismoLogoMark, PrismoWordmark } from "@/components/PrismoLogo";
import { useAuth } from "@/context/AuthContext";
import { Search, LogOut } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

const linkClass = ({ isActive }) =>
  `text-sm font-medium tracking-wide transition-colors ${
    isActive ? "text-white" : "text-neutral-400 hover:text-white"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/browse?q=${encodeURIComponent(q.trim())}`);
  };
  async function onboardingstatus() {
    const res = await api.get("/onboarding/status");

    return res.data.onboardingCompleted;
  }
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
          <NavLink to="/" end className={linkClass} data-testid="nav-home">
            Discover
          </NavLink>
          <NavLink
            to="/browse?type=movie"
            className={linkClass}
            data-testid="nav-movies"
          >
            Movies
          </NavLink>
          <NavLink
            to="/browse?type=series"
            className={linkClass}
            data-testid="nav-series"
          >
            Series
          </NavLink>
          <NavLink
            to="/browse?type=song"
            className={linkClass}
            data-testid="nav-songs"
          >
            Music
          </NavLink>
          {user && (
            <NavLink
              to="/watchlist"
              className={linkClass}
              data-testid="nav-watchlist"
            >
              My List
            </NavLink>
          )}
          {!onboardingstatus() && (
            <NavLink
              to="/onBoarding"
              className={linkClass}
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
              <span
                className="hidden text-sm text-neutral-300 md:inline"
                data-testid="nav-username"
              >
                {user.username}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                data-testid="nav-logout-btn"
                className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 transition hover:border-[#FF0055]/60 hover:text-[#FF0055]"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
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
        </div>
      </div>
    </header>
  );
}
