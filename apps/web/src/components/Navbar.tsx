import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-white text-black"
        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold">
            F
          </div>
          <span className="font-semibold text-lg tracking-tight">
            FotoOwl Media
          </span>
        </Link>
                <nav className="flex items-center gap-2">
          <Link to="/" className={linkClass("/")}>
            Discover
          </Link>
          <Link to="/search" className={linkClass("/search")}>
            Search
          </Link>
          <Link to="/reels" className={linkClass("/reels")}>
            Reels
          </Link>
          <Link
            to="/docs/sdk"
            className={
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
              (window.location.pathname.startsWith("/docs")
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800")
            }
          >
            Docs
          </Link>
        </nav>
      </div>
    </header>
  );
}
