import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        // The complete morph happens over the first 90px of scrolling.
        const progress = Math.min(window.scrollY / 90, 1);
        setScrollProgress(progress);
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-ink-900 text-white"
        : "text-ink-600 hover:text-ink-900 hover:bg-cream-200"
    }`;

  const mobileLinkClass = (path: string) =>
    `block w-full px-4 py-3 rounded-xl text-sm font-medium ${
      isActive(path)
        ? "bg-ink-900 text-white"
        : "text-ink-700 hover:bg-cream-200"
    }`;

  return (
    <div
      className="navbar-shell"
      style={
        {
          "--nav-progress": scrollProgress,
        } as React.CSSProperties
      }
    >
      <header className="navbar-pill">
        <div className="navbar-inner">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <OwlLogo />

            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-xl tracking-tight text-ink-900">
                FOTO
              </span>
              <span className="font-extrabold text-xl tracking-tight text-amber-500">
                OWL
              </span>

              <span className="navbar-tagline hidden md:inline">Media SDK</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link to="/" className={linkClass("/")}>
              Discover
            </Link>
            <Link to="/search" className={linkClass("/search")}>
              Search
            </Link>
            <Link to="/reels" className={linkClass("/reels")}>
              Reels
            </Link>
            <Link to="/docs/sdk" className={linkClass("/docs")}>
              Docs
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-ink-900 hover:bg-cream-200"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-200 ${
            mobileOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="px-3 pb-3 pt-1 flex flex-col gap-1">
            <Link to="/" className={mobileLinkClass("/")}>
              Discover
            </Link>
            <Link to="/search" className={mobileLinkClass("/search")}>
              Search
            </Link>
            <Link to="/reels" className={mobileLinkClass("/reels")}>
              Reels
            </Link>
            <Link to="/docs/sdk" className={mobileLinkClass("/docs")}>
              Docs
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}

function OwlLogo() {
  return (
    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm group-hover:shadow-amber-glow transition-shadow shrink-0">
      <svg viewBox="0 0 100 100" className="w-6 h-6" aria-hidden="true">
        <ellipse cx="35" cy="45" rx="12" ry="14" fill="#0F1729" />
        <ellipse cx="65" cy="45" rx="12" ry="14" fill="#0F1729" />
        <circle cx="35" cy="45" r="5" fill="#FBB13C" className="owl-eye" />
        <circle cx="65" cy="45" r="5" fill="#FBB13C" className="owl-eye" />
        <path
          d="M 42 65 Q 50 72 58 65"
          stroke="#0F1729"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative w-5 h-5">
      <span
        className={`absolute left-0 top-1 h-0.5 w-5 bg-current rounded transition-transform duration-200 ${
          open ? "translate-y-1.5 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-current rounded transition-opacity duration-150 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 bottom-1 h-0.5 w-5 bg-current rounded transition-transform duration-200 ${
          open ? "-translate-y-1.5 -rotate-45" : ""
        }`}
      />
    </div>
  );
}
