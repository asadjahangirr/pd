import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSiteContent } from "../context/SiteContentContext.jsx";

// Page links — shared by the desktop bar and the mobile menu
const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "All Products" },
  { to: "/track", label: "Track Order" },
  { to: "/contact", label: "Contact Us" },
  { to: "/about", label: "About Us" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);     // add shadow after scroll
  const [searchOpen, setSearchOpen] = useState(false); // search field visible?
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // hamburger menu (mobile)
  const [query, setQuery] = useState("");

  const { count, setDrawerOpen } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const { images, text } = useSiteContent();

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  // Shadow when the page is scrolled a little
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-focus the search box when it opens
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Close the account dropdown when clicking anywhere outside it
  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const runSearch = () => {
    const q = query.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur transition-shadow duration-300 ${
        scrolled || mobileOpen ? "shadow-[0_1px_20px_rgba(23,36,31,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-5 lg:px-8">
        {/* Left: logo + brand name */}
        <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* ADD IMAGE: your logo -> client/public/images/logo.png */}
          <img src={images.logo} alt="Delight Pharma" className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
          {/* Brand name steps aside on phones while the search field is open */}
          <span className={`font-display text-lg font-semibold tracking-tight text-brand-800 sm:text-xl ${searchOpen ? "hidden sm:inline" : ""}`}>
            {text.brandName}
          </span>
        </Link>

        {/* Center: nav links (desktop only, hidden while the search field is open) */}
        {!searchOpen && (
          <nav className="hidden md:block">
            <ul className="flex items-center gap-5 font-body text-sm font-medium text-ink lg:gap-8">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <NavLink end={l.end} className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`} to={l.to}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Expanding search field (replaces the links when open) — styled as a proper pill */}
        {searchOpen && (
          <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-brand-50 px-4 py-2 animate-[fade-in_0.25s_ease] sm:mx-2">
            <i className="fa-solid fa-magnifying-glass text-brand-600"></i>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search products or pages…"
              className="w-full bg-transparent font-body text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="text-muted transition-colors hover:text-ink">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            )}
          </div>
        )}

        {/* Right: icons */}
        <div className="flex shrink-0 items-center gap-1 text-ink sm:gap-3">
          {/* Search toggle */}
          <button
            aria-label={searchOpen ? "Close search" : "Open search"}
            onClick={() => { setSearchOpen((s) => !s); setMobileOpen(false); }}
            className="icon-btn"
          >
            <i className={`fa-solid ${searchOpen ? "fa-xmark" : "fa-magnifying-glass"}`}></i>
          </button>

          {/* Cart — opens the slide-out drawer, shows the live count */}
          <button onClick={() => setDrawerOpen(true)} aria-label="Cart" className="icon-btn relative">
            <i className="fa-solid fa-cart-shopping"></i>
            {count > 0 && (
              <span key={count} className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 font-mono text-[10px] font-bold text-white animate-[pop_0.3s_ease]">
                {count}
              </span>
            )}
          </button>

          {/* Account menu — only rendered for a logged-in admin, so customers
             never see anything admin-related. The admin reaches the login page
             via a bookmarked /admin/login URL (not linked anywhere public). */}
          {isAuthenticated && (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button aria-label="Account" onClick={() => setUserMenuOpen((o) => !o)} className="icon-btn">
                <i className="fa-solid fa-user"></i>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-11 w-48 overflow-hidden rounded-xl border border-line bg-white shadow-[0_10px_40px_rgba(23,36,31,0.12)] animate-[fade-up_0.2s_ease]">
                  <Link to="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <i className="fa-solid fa-gauge-high w-4"></i> Admin Dashboard
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item w-full text-left">
                    <i className="fa-solid fa-right-from-bracket w-4"></i> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger (mobile only) — steps aside while searching so the field has room.
             Wrapped in a div so the responsive hide isn't overridden by .icon-btn's display. */}
          <div className={`md:hidden ${searchOpen ? "hidden" : ""}`}>
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => { setMobileOpen((o) => !o); setSearchOpen(false); }}
              className="icon-btn"
            >
              <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Mobile menu (accordion under the bar) ===== */}
      <div
        className={`overflow-hidden border-line bg-white transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          mobileOpen ? "max-h-[26rem] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 py-3">
          <ul className="flex flex-col gap-1 font-body text-[0.95rem] font-medium">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 transition-colors ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-brand-50"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Account links — only for a logged-in admin (hidden from customers) */}
          {isAuthenticated && (
            <div className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] text-ink transition-colors hover:bg-brand-50 hover:text-brand-700">
                <i className="fa-solid fa-gauge-high w-4"></i> Admin Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[0.95rem] text-ink transition-colors hover:bg-brand-50 hover:text-brand-700">
                <i className="fa-solid fa-right-from-bracket w-4"></i> Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
