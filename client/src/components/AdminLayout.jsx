import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSiteContent } from "../context/SiteContentContext.jsx";
import { fetchOrders, fetchMessages } from "../api/admin.js";
import { useAutoRefresh } from "../lib/useAutoRefresh.js";

const nav = [
  { to: "/admin", label: "Dashboard", icon: "fa-gauge-high", end: true },
  { to: "/admin/orders", label: "Orders", icon: "fa-receipt" },
  { to: "/admin/inbox", label: "Inbox", icon: "fa-envelope" },
  { to: "/admin/finance", label: "Finance", icon: "fa-chart-line" },
  { to: "/admin/products", label: "Products", icon: "fa-box" },
  { to: "/admin/categories", label: "Categories", icon: "fa-tags" },
  { to: "/admin/coupons", label: "Coupons", icon: "fa-ticket" },
  { to: "/admin/media", label: "Site images", icon: "fa-images" },
  { to: "/admin/content", label: "Site text", icon: "fa-pen-to-square" },
  { to: "/admin/appearance", label: "Appearance", icon: "fa-palette" },
];

/* Shared shell for every admin page: dark sidebar + top bar + content.
   Pass a `title` (top-bar heading) and optional `actions` (buttons shown
   on the right of the page header row). */
export default function AdminLayout({ title, actions, children }) {
  const { username, logout } = useAuth();
  const { images } = useSiteContent();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);
  const [counts, setCounts] = useState({ "/admin/orders": 0, "/admin/inbox": 0 });

  // Live badge counts for pending orders + unread messages
  const loadCounts = () => {
    fetchOrders()
      .then((o) => setCounts((c) => ({ ...c, "/admin/orders": o.filter((x) => x.status === "pending").length })))
      .catch(() => {});
    fetchMessages()
      .then((m) => setCounts((c) => ({ ...c, "/admin/inbox": m.filter((x) => !x.read).length })))
      .catch(() => {});
  };
  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAutoRefresh(loadCounts, 15000);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-mist">
      {/* Mobile overlay */}
      <div
        onClick={() => setSideOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 lg:hidden ${
          sideOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-900 text-brand-100 transition-transform duration-300 lg:translate-x-0 ${
          sideOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-brand-800 px-5">
          <img src={images.logo} alt="" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-semibold text-white">Delight Admin</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((n) => {
            const badge = counts[n.to] || 0;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setSideOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-2.5 font-body text-sm transition-colors ${
                    isActive ? "bg-brand-700 text-white" : "text-brand-200 hover:bg-brand-800 hover:text-white"
                  }`
                }
              >
                <i className={`fa-solid ${n.icon} w-4 text-center`}></i>
                <span className="flex-1">{n.label}</span>
                {badge > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-white">{badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-brand-800 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 font-body text-sm text-brand-200 transition-colors hover:bg-brand-800 hover:text-white"
          >
            <i className="fa-solid fa-arrow-up-right-from-square w-4 text-center"></i> View store
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/90 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)} className="icon-btn lg:hidden" aria-label="Open menu">
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 className="font-display text-lg font-semibold text-ink sm:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-body text-sm text-muted sm:inline">
              <i className="fa-solid fa-user-shield mr-1 text-brand-600"></i> {username || "admin"}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-full border border-line px-4 py-2 font-body text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <i className="fa-solid fa-right-from-bracket mr-1.5"></i> Logout
            </button>
          </div>
        </header>

        <main className="p-5 lg:p-8">
          {actions && (
            <div className="mb-6 flex flex-wrap items-center justify-end gap-3">{actions}</div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
