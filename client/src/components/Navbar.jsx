import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);     // add shadow after scroll
  const [searchOpen, setSearchOpen] = useState(false); // search field visible?
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const cartCount = 0; // TODO: connect to real cart state later

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

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
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_20px_rgba(23,36,31,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        {/* Left: logo + brand name */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          {/* ADD IMAGE: your logo -> client/public/images/logo.png */}
          <img src="/images/logo.png" alt="Delight Pharma" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-semibold tracking-tight text-brand-800">
            Delight Pharma
          </span>
        </Link>

        {/* Center: nav links (hidden while the search field is open) */}
        {!searchOpen && (
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 font-body text-sm font-medium text-ink">
              <li><Link className="nav-link" to="/">Home</Link></li>
              <li><Link className="nav-link" to="/products">All Products</Link></li>
              <li><Link className="nav-link" to="/contact">Contact Us</Link></li>
              <li><Link className="nav-link" to="/about">About Us</Link></li>
            </ul>
          </nav>
        )}

        {/* Expanding search field (replaces the links when open) */}
        {searchOpen && (
          <div className="flex flex-1 items-center gap-2 animate-[fade-in_0.25s_ease]">
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
          </div>
        )}

        {/* Right: icons */}
        <div className="flex shrink-0 items-center gap-4 text-ink sm:gap-5">
          {/* Search toggle */}
          <button
            aria-label={searchOpen ? "Close search" : "Open search"}
            onClick={() => setSearchOpen((s) => !s)}
            className="icon-btn"
          >
            <i className={`fa-solid ${searchOpen ? "fa-xmark" : "fa-magnifying-glass"}`}></i>
          </button>

          {/* Cart with live count badge */}
          <Link to="/cart" aria-label="Cart" className="icon-btn relative">
            <i className="fa-solid fa-cart-shopping"></i>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 font-mono text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account: dropdown with User vs Admin login */}
          <div className="relative" ref={userMenuRef}>
            <button aria-label="Account" onClick={() => setUserMenuOpen((o) => !o)} className="icon-btn">
              <i className="fa-solid fa-user"></i>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-11 w-48 overflow-hidden rounded-xl border border-line bg-white shadow-[0_10px_40px_rgba(23,36,31,0.12)] animate-[fade-up_0.2s_ease]">
                <Link to="/login" className="dropdown-item">
                  <i className="fa-regular fa-user w-4"></i> Sign up/Login as User
                </Link>
                <Link to="/admin/login" className="dropdown-item">
                  <i className="fa-solid fa-user-shield w-4"></i> Sign up/Login as Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
