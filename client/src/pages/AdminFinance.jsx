import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchOrders, fetchExpenses, createExpense, deleteExpense } from "../api/admin.js";
import { useAutoRefresh } from "../lib/useAutoRefresh.js";

const rs = (n) => `Rs. ${Math.round(n || 0).toLocaleString()}`;
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });

function Stat({ icon, label, value, sub, tone = "brand" }) {
  const tones = { brand: "bg-brand-50 text-brand-600", danger: "bg-danger/10 text-danger", accent: "bg-accent/15 text-accent" };
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${tones[tone]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">{label}</p>
      {sub && <p className="mt-0.5 font-body text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function AdminFinance() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", amount: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    Promise.all([fetchOrders(), fetchExpenses()])
      .then(([o, e]) => {
        setOrders(o);
        setExpenses(e);
      })
      .catch((err) => {
        if (!handleAuthError(err)) setError("Couldn't load finance data");
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

  const DELIVERY_COST = 200; // what you pay the courier per delivery

  const s = useMemo(() => {
    const completed = orders.filter((o) => o.status === "completed");
    // product sales only (shipping is a pass-through), minus any coupon discounts
    const revenue = completed.reduce((a, o) => a + (o.subtotal || 0) - (o.discount || 0), 0);
    const cogs = completed.reduce(
      (a, o) => a + (o.items || []).reduce((b, it) => b + (it.cost || 0) * (it.qty || 0), 0),
      0
    );
    const gross = revenue - cogs;
    // delivery you covered: courier cost for every completed order minus what
    // customers paid in shipping. Paid-shipping orders net to 0; free ones cost you.
    const shippingCollected = completed.reduce((a, o) => a + (o.shipping || 0), 0);
    const deliveryCost = Math.max(0, completed.length * DELIVERY_COST - shippingCollected);
    const expTotal = expenses.reduce((a, e) => a + (e.amount || 0), 0);
    const net = gross - deliveryCost - expTotal;

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const weekAgo = Date.now() - 7 * 864e5;
    const active = orders.filter((o) => o.status !== "cancelled");
    const inToday = active.filter((o) => new Date(o.createdAt) >= startToday);
    const inWeek = active.filter((o) => new Date(o.createdAt).getTime() >= weekAgo);
    const sum = (arr) => arr.reduce((a, o) => a + (o.total || 0), 0);

    const byStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    orders.forEach((o) => (byStatus[o.status] = (byStatus[o.status] || 0) + 1));

    return {
      revenue, cogs, gross, deliveryCost, expTotal, net,
      todayCount: inToday.length, todaySales: sum(inToday),
      weekCount: inWeek.length, weekSales: sum(inWeek),
      byStatus,
    };
  }, [orders, expenses]);

  const addExpense = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || form.amount === "") {
      setError("Enter an expense title and amount.");
      return;
    }
    setSaving(true);
    try {
      await createExpense({ title: form.title.trim(), amount: Number(form.amount), note: form.note.trim() });
      setForm({ title: "", amount: "", note: "" });
      load();
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (id) => {
    try {
      await deleteExpense(id);
      load();
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Finance">
        <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Finance">
      {error && (
        <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
          <span><i className="fa-solid fa-circle-exclamation mr-1.5"></i> {error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss"><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      {/* Sales / profit stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon="fa-calendar-day" label="Sales today" value={rs(s.todaySales)} sub={`${s.todayCount} order${s.todayCount !== 1 ? "s" : ""}`} />
        <Stat icon="fa-calendar-week" label="Sales this week" value={rs(s.weekSales)} sub={`${s.weekCount} order${s.weekCount !== 1 ? "s" : ""}`} />
        <Stat icon="fa-sack-dollar" label="Net profit" value={rs(s.net)} tone={s.net < 0 ? "danger" : "brand"} sub="completed − costs − expenses" />
        <Stat icon="fa-hourglass-half" label="Pending orders" value={s.byStatus.pending} tone={s.byStatus.pending ? "accent" : "brand"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Profit breakdown */}
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Profit</h2>
          <p className="mt-0.5 font-body text-xs text-muted">From completed orders only.</p>
          <div className="mt-4 space-y-3 font-body text-sm">
            <Row label="Product revenue" value={rs(s.revenue)} />
            <Row label="− Cost of goods" value={rs(s.cogs)} muted />
            <Row label="= Gross profit" value={rs(s.gross)} strong />
            <Row label="− Delivery you covered" value={rs(s.deliveryCost)} muted />
            <Row label="− Other expenses" value={rs(s.expTotal)} muted />
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="font-display text-base font-semibold text-ink">Net profit</span>
              <span className={`font-mono text-lg font-bold ${s.net < 0 ? "text-danger" : "text-brand-700"}`}>{rs(s.net)}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4 text-center font-body text-xs text-muted sm:grid-cols-4">
            <div><p className="font-display text-base font-semibold text-ink">{s.byStatus.pending}</p>Pending</div>
            <div><p className="font-display text-base font-semibold text-ink">{s.byStatus.confirmed}</p>Confirmed</div>
            <div><p className="font-display text-base font-semibold text-ink">{s.byStatus.completed}</p>Completed</div>
            <div><p className="font-display text-base font-semibold text-ink">{s.byStatus.cancelled}</p>Cancelled</div>
          </div>
        </div>

        {/* Expenses */}
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Expenses</h2>
            <span className="font-mono text-sm font-bold text-ink">{rs(s.expTotal)}</span>
          </div>

          <form onSubmit={addExpense} className="mt-4 space-y-2">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Expense name (e.g. Ads, Packaging, Rent)" className="review-input" />
            <div className="flex gap-2">
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount (Rs.)" className="review-input flex-1" />
              <button disabled={saving} className="btn-primary shrink-0 justify-center disabled:opacity-60"><i className="fa-solid fa-plus mr-2"></i> Add</button>
            </div>
          </form>

          <div className="mt-4 space-y-2">
            {expenses.length === 0 && <p className="font-body text-sm text-muted">No expenses recorded yet.</p>}
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-body text-sm text-ink">{e.title}</p>
                  <p className="font-mono text-[11px] text-muted">{fmtDate(e.date)}{e.note ? ` · ${e.note}` : ""}</p>
                </div>
                <span className="font-mono text-sm text-ink">{rs(e.amount)}</span>
                <button onClick={() => removeExpense(e.id)} aria-label="Delete" className="text-muted transition-colors hover:text-danger">
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 font-body text-xs text-muted">
        <i className="fa-solid fa-circle-info mr-1.5 text-brand-400"></i>
        Profit uses <b>completed</b> orders and the cost you set per product. Delivery is handled automatically: when a customer pays shipping it's passed to the courier (no effect on profit); when you give <b>free delivery</b>, the courier cost (Rs. {DELIVERY_COST}) is deducted here.
      </p>
    </AdminLayout>
  );
}

function Row({ label, value, strong, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted" : strong ? "font-semibold text-ink" : "text-ink"}>{label}</span>
      <span className={`font-mono ${strong ? "font-bold text-ink" : "text-ink"}`}>{value}</span>
    </div>
  );
}
