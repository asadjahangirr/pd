import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchOrders, updateOrderStatus, deleteOrder } from "../api/admin.js";
import { useAutoRefresh, triggerRefresh } from "../lib/useAutoRefresh.js";

const STATUS_META = {
  pending: { label: "Pending", cls: "bg-accent/15 text-accent" },
  confirmed: { label: "Confirmed", cls: "bg-brand-100 text-brand-700" },
  completed: { label: "Completed", cls: "bg-brand-600 text-white" },
  cancelled: { label: "Cancelled", cls: "bg-danger/10 text-danger" },
};
const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

const waLink = (phone) => `https://wa.me/${String(phone || "").replace(/\D/g, "")}`;
const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

// wrap a CSV cell in quotes if it contains commas/quotes/newlines
const csvCell = (v) => {
  const str = String(v ?? "");
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export default function AdminOrders() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [busyId, setBusyId] = useState(null);

  const handleAuthError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    fetchOrders()
      .then(setOrders)
      .catch((err) => {
        if (!handleAuthError(err)) setError("Couldn't load orders");
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAutoRefresh(() => load(true), 20000);

  const flash = (m) => {
    setBanner(m);
    setTimeout(() => setBanner(""), 3000);
  };

  const counts = useMemo(() => {
    const c = { all: orders.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    orders.forEach((o) => (c[o.status] = (c[o.status] || 0) + 1));
    return c;
  }, [orders]);

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const act = async (o, status) => {
    setBusyId(o.id);
    setError("");
    try {
      await updateOrderStatus(o.id, status);
      await load(true);
      triggerRefresh();
      flash(`Order #${o.orderNumber} → ${STATUS_META[status].label}.`);
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const del = async (o) => {
    if (!window.confirm(`Delete order #${o.orderNumber}? This can't be undone.`)) return;
    setBusyId(o.id);
    try {
      await deleteOrder(o.id);
      await load(true);
      triggerRefresh();
      flash(`Order #${o.orderNumber} deleted.`);
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const header = ["Order #", "Date", "Status", "Customer", "Phone", "Email", "Address", "City", "Items", "Subtotal", "Discount", "Coupon", "Shipping", "Total", "Payment"];
    const rows = shown.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString(),
      o.status,
      o.customer?.name || "",
      o.customer?.phone || "",
      o.customer?.email || "",
      o.customer?.address || "",
      o.customer?.city || "",
      (o.items || []).map((it) => `${it.name} x${it.qty}`).join("; "),
      o.subtotal ?? "",
      o.discount ?? 0,
      o.coupon || "",
      o.shipping ?? "",
      o.total ?? "",
      o.paymentMethod || "COD",
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }); // BOM so Excel reads it right
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Orders">
      {banner && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 font-body text-sm text-brand-800">
          <i className="fa-solid fa-circle-check text-brand-600"></i> {banner}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
          <span><i className="fa-solid fa-circle-exclamation mr-1.5"></i> {error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss"><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      {/* Filter tabs + export */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`chip ${filter === f ? "chip-active" : ""}`}>
              {f === "all" ? "All" : STATUS_META[f].label} <span className="opacity-70">({counts[f] || 0})</span>
            </button>
          ))}
        </div>
        <button
          onClick={exportCsv}
          disabled={shown.length === 0}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-line px-4 py-2 font-body text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
        >
          <i className="fa-solid fa-file-csv mr-2"></i> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i>
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <i className="fa-solid fa-receipt mb-3 text-4xl text-brand-200"></i>
          <p className="font-display text-lg text-ink">No orders {filter !== "all" ? `(${filter})` : "yet"}</p>
          <p className="mt-1 font-body text-sm text-muted">New orders from the store will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;
            const busy = busyId === o.id;
            return (
              <div key={o.id} className="rounded-2xl border border-line bg-white p-5">
                {/* header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">Order #{o.orderNumber}</p>
                    <p className="font-mono text-xs text-muted">{fmtDate(o.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide ${meta.cls}`}>{meta.label}</span>
                </div>

                {/* body */}
                <div className="grid gap-5 py-4 md:grid-cols-2">
                  {/* customer */}
                  <div>
                    <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-brand-500">Customer</p>
                    <p className="font-body text-sm font-semibold text-ink">{o.customer?.name}</p>
                    <p className="font-body text-sm text-muted">
                      <a href={waLink(o.customer?.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                        <i className="fa-brands fa-whatsapp"></i> {o.customer?.phone}
                      </a>
                    </p>
                    {o.customer?.email && <p className="font-body text-sm text-muted">{o.customer.email}</p>}
                    <p className="mt-1 font-body text-sm text-muted">
                      {o.customer?.address}{o.customer?.city ? `, ${o.customer.city}` : ""}
                    </p>
                    {o.customer?.notes && <p className="mt-1 font-body text-xs italic text-muted">“{o.customer.notes}”</p>}
                  </div>

                  {/* items */}
                  <div>
                    <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-brand-500">Items</p>
                    <div className="space-y-1">
                      {o.items?.map((it, i) => (
                        <div key={i} className="flex justify-between font-body text-sm">
                          <span className="text-ink">{it.name} <span className="text-muted">× {it.qty}</span></span>
                          <span className="font-mono text-muted">Rs. {(it.price * it.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 space-y-1 border-t border-line pt-2 font-body text-sm">
                      {o.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted">Discount{o.coupon ? ` (${o.coupon})` : ""}</span>
                          <span className="font-mono text-brand-700">− Rs. {o.discount?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted">Shipping</span>
                        <span className="font-mono text-ink">{o.shipping === 0 ? "Free" : `Rs. ${o.shipping?.toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-ink">Total (COD)</span>
                        <span className="font-mono font-bold text-brand-700">Rs. {o.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
                  {busy && <i className="fa-solid fa-spinner fa-spin mr-1 text-brand-400"></i>}
                  {o.status === "pending" && (
                    <button disabled={busy} onClick={() => act(o, "confirmed")} className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 font-body text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60">
                      <i className="fa-solid fa-check mr-1.5"></i> Confirm
                    </button>
                  )}
                  {(o.status === "pending" || o.status === "confirmed") && (
                    <button disabled={busy} onClick={() => act(o, "completed")} className="inline-flex items-center rounded-full border border-brand-600 px-4 py-2 font-body text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60">
                      <i className="fa-solid fa-box-open mr-1.5"></i> Mark completed
                    </button>
                  )}
                  {o.status !== "cancelled" && o.status !== "completed" && (
                    <button disabled={busy} onClick={() => act(o, "cancelled")} className="inline-flex items-center rounded-full border border-line px-4 py-2 font-body text-xs font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-60">
                      <i className="fa-solid fa-ban mr-1.5"></i> Cancel
                    </button>
                  )}
                  <button disabled={busy} onClick={() => del(o)} className="inline-flex items-center rounded-full border border-line px-3 py-2 font-body text-xs font-semibold text-muted transition-colors hover:bg-brand-50 hover:text-danger disabled:opacity-60" title="Delete order">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 font-body text-xs text-muted">
        <i className="fa-solid fa-circle-info mr-1.5 text-brand-400"></i>
        Marking an order <b>completed</b> reduces the product stock automatically. Tap a customer's number to message them on WhatsApp.
      </p>
    </AdminLayout>
  );
}
