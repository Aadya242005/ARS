import { Link, NavLink, useNavigate } from "react-router-dom";
import { Volume2, VolumeX, LogOut, LogIn, User } from "lucide-react";
import { useSoundSettings } from "../context/SoundContext";
import { useAuth } from "../context/AuthContext";

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `text-sm px-3 py-2 rounded-xl transition border ${
        isActive
          ? "bg-white/10 border-white/15 text-white"
          : "border-transparent text-white/80 hover:text-white hover:bg-white/5"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const nav = useNavigate();
  const { enabled, toggle } = useSoundSettings();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-300/30 to-indigo-400/30 border border-white/15" />
          <div>
            <div className="font-semibold leading-5 text-white">ARS Lab</div>
            <div className="text-[11px] text-white/60">Autonomous Research Agent</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/about">About</NavItem>
          <NavItem to="/search">Search Research</NavItem>
          <NavItem to="/experiment">Experiment Mode</NavItem>
          <NavItem to="/app">Dashboard</NavItem>
        </nav>

        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={toggle}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle sound"
            title={enabled ? "Sound ON (click to mute)" : "Sound OFF (click to unmute)"}
          >
            {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline text-sm">{enabled ? "Sound" : "Muted"}</span>
          </button>

          {/* Normal button (No Sound Button component needed) */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md">
                <User className="h-3 w-3" />
                {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="hidden sm:inline-flex items-center gap-1 text-sm px-3 py-2 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition border border-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => nav("/login")}
              className="hidden sm:inline-flex items-center gap-1 text-sm px-4 py-2 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}





