import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { fetchCategories, fetchOrders, fetchMessages } from "../api/admin.js";
import { useAutoRefresh } from "../lib/useAutoRefresh.js";

function StatCard({ icon, label, value, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${tones[tone]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { products, loading } = useProducts();
  const [catCount, setCatCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [pending, setPending] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  const loadStats = () => {
    fetchCategories()
      .then((c) => setCatCount(c.length))
      .catch(() => setCatCount(null));
    fetchOrders()
      .then((o) => {
        setOrderCount(o.length);
        setPending(o.filter((x) => x.status === "pending").length);
      })
      .catch(() => {});
    fetchMessages()
      .then((m) => setUnreadMsgs(m.filter((x) => !x.read).length))
      .catch(() => {});
  };
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAutoRefresh(loadStats, 20000);

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="py-20 text-center">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i>
          <p className="mt-3 font-body text-sm text-muted">Loading…</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon="fa-box" label="Products" value={products.length} />
            <StatCard icon="fa-tags" label="Categories" value={catCount ?? "—"} />
            <StatCard icon="fa-layer-group" label="Total stock" value={totalStock} />
            <StatCard icon="fa-hourglass-half" label="Pending orders" value={orderCount === null ? "—" : pending} tone={pending ? "danger" : "brand"} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/admin/orders" className="group flex items-center justify-between rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_12px_36px_rgba(23,36,31,0.08)]">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  Orders
                  {pending > 0 && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-white">{pending} new</span>}
                </h3>
                <p className="mt-1 font-body text-sm text-muted">Confirm, complete, cancel.</p>
              </div>
              <i className="fa-solid fa-arrow-right text-brand-400 transition-transform group-hover:translate-x-1"></i>
            </Link>
            <Link to="/admin/inbox" className="group flex items-center justify-between rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_12px_36px_rgba(23,36,31,0.08)]">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  Inbox
                  {unreadMsgs > 0 && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-white">{unreadMsgs} new</span>}
                </h3>
                <p className="mt-1 font-body text-sm text-muted">Customer messages.</p>
              </div>
              <i className="fa-solid fa-arrow-right text-brand-400 transition-transform group-hover:translate-x-1"></i>
            </Link>
            <Link to="/admin/products" className="group flex items-center justify-between rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_12px_36px_rgba(23,36,31,0.08)]">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">Manage products</h3>
                <p className="mt-1 font-body text-sm text-muted">Add, edit, price, stock, delete.</p>
              </div>
              <i className="fa-solid fa-arrow-right text-brand-400 transition-transform group-hover:translate-x-1"></i>
            </Link>
            <Link to="/admin/categories" className="group flex items-center justify-between rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_12px_36px_rgba(23,36,31,0.08)]">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">Manage categories</h3>
                <p className="mt-1 font-body text-sm text-muted">Add, rename, show/hide, delete.</p>
              </div>
              <i className="fa-solid fa-arrow-right text-brand-400 transition-transform group-hover:translate-x-1"></i>
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
