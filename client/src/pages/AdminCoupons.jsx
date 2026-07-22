import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from "../api/admin.js";

const EMPTY = { code: "", type: "percent", value: "", minSubtotal: "", expiresAt: "" };

export default function AdminCoupons() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const handleAuthError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };

  const load = () => {
    setLoading(true);
    fetchCoupons()
      .then(setCoupons)
      .catch((err) => {
        if (!handleAuthError(err)) setError("Couldn't load coupons");
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const flash = (m) => {
    setBanner(m);
    setTimeout(() => setBanner(""), 3000);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.code.trim() || form.value === "" || Number(form.value) <= 0) {
      setError("Enter a code and a value greater than 0.");
      return;
    }
    setSaving(true);
    try {
      await createCoupon({
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        minSubtotal: form.minSubtotal === "" ? 0 : Number(form.minSubtotal),
        expiresAt: form.expiresAt || null,
      });
      setForm(EMPTY);
      load();
      flash("Coupon created.");
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      await updateCoupon(c.id, { active: !c.active });
      load();
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  const del = async (c) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      await deleteCoupon(c.id);
      load();
      flash("Coupon deleted.");
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  const discountText = (c) => (c.type === "percent" ? `${c.value}% off` : `Rs. ${c.value} off`);

  return (
    <AdminLayout title="Coupons">
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

      {/* Create coupon */}
      <form onSubmit={add} className="mb-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-ink">New coupon</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Code">
            <input value={form.code} onChange={set("code")} placeholder="SAVE10" className="review-input uppercase" />
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={set("type")} className="review-input">
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed Rs.</option>
            </select>
          </Field>
          <Field label={form.type === "percent" ? "Percent (%)" : "Amount (Rs.)"}>
            <input type="number" min="0" value={form.value} onChange={set("value")} placeholder={form.type === "percent" ? "10" : "200"} className="review-input" />
          </Field>
          <Field label="Min order (Rs.)">
            <input type="number" min="0" value={form.minSubtotal} onChange={set("minSubtotal")} placeholder="0" className="review-input" />
          </Field>
          <Field label="Expires (optional)">
            <input type="date" value={form.expiresAt} onChange={set("expiresAt")} className="review-input" />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving…</> : <><i className="fa-solid fa-plus mr-2"></i>Create coupon</>}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-16 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i></div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center font-body text-sm text-muted">
          No coupons yet — create one above.
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            return (
              <div key={c.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4 ${!c.active || expired ? "opacity-60" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-mono text-base font-bold tracking-wide text-ink">
                    {c.code}
                    {!c.active && <span className="rounded-full bg-line px-2 py-0.5 font-body text-[10px] font-bold uppercase text-muted">Off</span>}
                    {expired && <span className="rounded-full bg-danger/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase text-danger">Expired</span>}
                  </p>
                  <p className="font-body text-sm text-muted">
                    {discountText(c)}
                    {c.minSubtotal ? ` · min Rs. ${c.minSubtotal.toLocaleString()}` : ""}
                    {c.expiresAt ? ` · until ${new Date(c.expiresAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <button onClick={() => toggleActive(c)} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700">
                  <i className={`fa-solid ${c.active ? "fa-toggle-on text-brand-600" : "fa-toggle-off"} mr-1.5`}></i> {c.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => del(c)} aria-label="Delete" className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-danger transition-colors hover:bg-danger/10">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 font-body text-xs text-muted">
        <i className="fa-solid fa-circle-info mr-1.5 text-brand-400"></i>
        Customers enter these codes in the cart's promo box. Percent coupons take a % off the subtotal; fixed coupons take a flat Rs. amount.
      </p>
    </AdminLayout>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-brand-500">{label}</span>
      {children}
    </label>
  );
}
