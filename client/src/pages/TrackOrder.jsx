import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { trackOrder } from "../api/orders.js";

const STEPS = [
  { key: "pending", label: "Placed", icon: "fa-clock" },
  { key: "confirmed", label: "Confirmed", icon: "fa-circle-check" },
  { key: "completed", label: "Delivered", icon: "fa-box-open" },
];

const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("number") || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // prefill number from the URL if present
    const n = params.get("number");
    if (n) setOrderNumber(n);
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    if (!orderNumber || !phone.trim()) {
      setError("Enter your order number and phone.");
      return;
    }
    setLoading(true);
    try {
      const data = await trackOrder(Number(orderNumber), phone.trim());
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelled = order?.status === "cancelled";
  const currentStep = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line bg-mist">
          <div className="mx-auto max-w-7xl px-5 py-10 text-center lg:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Track order</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">Where's my order?</h1>
            <p className="mt-2 font-body text-sm text-muted">Enter your order number and the phone you used at checkout.</p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-5 py-12 lg:px-8">
          <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-6 md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-brand-500">Order number</span>
                <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="10000" className="review-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-brand-500">Phone (WhatsApp)</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 3XX XXXXXXX" className="review-input" />
              </label>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full justify-center disabled:opacity-60">
              {loading ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Checking…</> : <><i className="fa-solid fa-magnifying-glass mr-2"></i> Track order</>}
            </button>
          </form>

          {order && (
            <div className="mt-6 rounded-2xl border border-line bg-white p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Order #{order.orderNumber}</h2>
                <span className="font-mono text-xs text-muted">{fmtDate(order.createdAt)}</span>
              </div>

              {cancelled ? (
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
                  <i className="fa-solid fa-ban"></i> This order was cancelled.
                </div>
              ) : (
                <div className="mt-6 flex items-center justify-between">
                  {STEPS.map((s, i) => {
                    const doneStep = i <= currentStep;
                    return (
                      <div key={s.key} className="flex flex-1 flex-col items-center text-center">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${doneStep ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-300"}`}>
                          <i className={`fa-solid ${s.icon}`}></i>
                        </div>
                        <span className={`mt-2 font-mono text-[11px] uppercase tracking-widest ${doneStep ? "text-brand-700" : "text-muted"}`}>{s.label}</span>
                        {i < STEPS.length - 1 && (
                          <span className={`absolute mt-5 hidden h-0.5 w-1/3 ${i < currentStep ? "bg-brand-600" : "bg-line"}`}></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 space-y-2 border-t border-line pt-5">
                {order.items.map((it, i) => (
                  <div key={i} className="flex justify-between font-body text-sm">
                    <span className="text-ink">{it.name} <span className="text-muted">× {it.qty}</span></span>
                    <span className="font-mono text-muted">Rs. {(it.price * it.qty).toLocaleString()}</span>
                  </div>
                ))}
                {order.discount > 0 && (
                  <div className="flex justify-between font-body text-sm"><span className="text-muted">Discount</span><span className="font-mono text-brand-700">− Rs. {order.discount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between font-body text-sm"><span className="text-muted">Shipping</span><span className="font-mono text-ink">{order.shipping === 0 ? "Free" : `Rs. ${order.shipping.toLocaleString()}`}</span></div>
                <div className="flex justify-between border-t border-line pt-2 font-body text-base"><span className="font-semibold text-ink">Total (COD)</span><span className="font-mono font-bold text-brand-700">Rs. {order.total.toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
