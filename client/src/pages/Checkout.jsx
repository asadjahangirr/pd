import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useCart } from "../context/CartContext.jsx";
import { placeOrder } from "../api/orders.js";
import { validateCoupon } from "../api/coupons.js";

const FREE_SHIPPING = 2500;
const SHIPPING_COST = 200;

export default function Checkout() {
  const { items, subtotal, discount, coupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", address: "", city: "", postal: "", phone: "", notes: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");

  const shipping = items.length && subtotal < FREE_SHIPPING ? SHIPPING_COST : 0;
  const total = subtotal + shipping - discount;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyCode = async () => {
    const c = code.trim();
    if (!c) return;
    setApplying(true);
    setCouponMsg("");
    try {
      const result = await validateCoupon(c, subtotal);
      applyCoupon(result);
      setCode("");
    } catch (err) {
      setCouponMsg(err.message);
    } finally {
      setApplying(false);
    }
  };

  // ---- Success screen ----
  if (done) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-mist px-5 py-16">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-[0_18px_50px_rgba(23,36,31,0.08)] animate-[fade-up_0.5s_ease] md:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl text-brand-600">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink">Order placed!</h1>
            <p className="mt-2 font-body text-sm text-muted">Thank you, {done.customer?.name}. We'll confirm on WhatsApp shortly.</p>
            <div className="mx-auto mt-5 inline-block rounded-xl bg-brand-50 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-brand-500">Order number</p>
              <p className="font-display text-2xl font-bold text-brand-700">#{done.orderNumber}</p>
            </div>
            <p className="mt-5 font-body text-sm text-muted">
              <i className="fa-solid fa-money-bill-wave mr-1.5 text-brand-500"></i>
              Pay cash on delivery — total <span className="font-semibold text-ink">Rs. {done.total?.toLocaleString()}</span>
            </p>
            <div className="mt-7 flex flex-col items-center gap-3">
              <Link to="/products" className="btn-primary inline-flex">Continue shopping</Link>
              <Link to={`/track?number=${done.orderNumber}`} className="font-body text-sm font-semibold text-brand-700 hover:underline">
                <i className="fa-solid fa-location-dot mr-1"></i> Track this order
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---- Empty cart ----
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center px-5 py-28 text-center">
          <i className="fa-solid fa-basket-shopping mb-5 text-5xl text-brand-200"></i>
          <h1 className="font-display text-3xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-3 font-body text-sm text-muted">Add something before checking out.</p>
          <Link to="/products" className="btn-primary mt-8 inline-flex">Shop products</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const name = `${form.firstName} ${form.lastName}`.trim();
    if (!name || !form.phone.trim() || !form.address.trim()) {
      setError("Please fill in your name, phone (WhatsApp), and address.");
      return;
    }
    setPlacing(true);
    try {
      const order = await placeOrder({
        customer: {
          name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          notes: form.postal ? `Postal: ${form.postal}${form.notes ? ` · ${form.notes}` : ""}` : form.notes,
        },
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        couponCode: coupon?.code || "",
      });
      clearCart();
      setDone(order);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1 bg-mist">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-12">
          {/* ===== Form ===== */}
          <form onSubmit={submit} className="order-2 space-y-8 animate-[fade-up_0.4s_ease] lg:order-1">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            {/* Contact */}
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">Contact</h2>
              <input type="email" value={form.email} onChange={set("email")} placeholder="Email (for order updates)" autoComplete="email" className="review-input" />
            </section>

            {/* Delivery */}
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">Delivery</h2>
              <div className="space-y-3">
                <div className="relative">
                  <select disabled className="review-input appearance-none bg-mist text-muted">
                    <option>Pakistan</option>
                  </select>
                  <i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted"></i>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={form.firstName} onChange={set("firstName")} placeholder="First name" autoComplete="given-name" className="review-input" />
                  <input value={form.lastName} onChange={set("lastName")} placeholder="Last name" autoComplete="family-name" className="review-input" />
                </div>
                <input value={form.address} onChange={set("address")} placeholder="Address" autoComplete="street-address" className="review-input" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={form.city} onChange={set("city")} placeholder="City" autoComplete="address-level2" className="review-input" />
                  <input value={form.postal} onChange={set("postal")} placeholder="Postal code (optional)" autoComplete="postal-code" className="review-input" />
                </div>
                <input value={form.phone} onChange={set("phone")} placeholder="Phone (WhatsApp — for order confirmation)" autoComplete="tel" className="review-input" />
              </div>
            </section>

            {/* Shipping method */}
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">Shipping method</h2>
              <div className="flex items-center justify-between rounded-xl border border-brand-500 bg-brand-50 px-4 py-3">
                <span className="flex items-center gap-2 font-body text-sm text-ink">
                  <i className="fa-solid fa-truck-fast text-brand-600"></i>
                  {shipping === 0 ? "Free delivery" : "Delivery charges"}
                </span>
                <span className="font-mono text-sm font-semibold text-ink">{shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}</span>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="mb-1 font-display text-lg font-semibold text-ink">Payment</h2>
              <p className="mb-3 font-body text-xs text-muted">Pay in cash when your order arrives.</p>
              <div className="flex items-center gap-3 rounded-xl border border-brand-500 bg-brand-50 px-4 py-3">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-600">
                  <span className="h-2 w-2 rounded-full bg-brand-600"></span>
                </span>
                <i className="fa-solid fa-money-bill-wave text-brand-600"></i>
                <span className="font-body text-sm font-semibold text-ink">Cash on Delivery (COD)</span>
              </div>
            </section>

            <button type="submit" disabled={placing} className="btn-primary w-full justify-center py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-60">
              {placing ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Placing order…</> : <>Complete order</>}
            </button>
            <p className="text-center font-body text-xs text-muted"><i className="fa-solid fa-lock mr-1"></i> Your details are only used for this order.</p>
          </form>

          {/* ===== Order summary ===== */}
          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>

              <div className="mt-4 max-h-72 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-line bg-brand-50 p-1">
                      <img src={item.image} alt="" className="max-h-full w-auto object-contain" />
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] font-bold text-white">{item.qty}</span>
                    </div>
                    <p className="min-w-0 flex-1 truncate font-body text-sm text-ink">{item.name}</p>
                    <span className="font-mono text-sm text-ink">Rs. {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {coupon && discount > 0 ? (
                <div className="mt-5 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
                  <span className="font-body text-sm text-brand-800">
                    <i className="fa-solid fa-tag mr-1.5 text-brand-600"></i>
                    <span className="font-mono font-semibold">{coupon.code}</span> applied
                  </span>
                  <button type="button" onClick={removeCoupon} className="font-body text-xs font-semibold text-muted transition-colors hover:text-danger">Remove</button>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCode(); } }}
                      placeholder="Promo code"
                      className="review-input"
                    />
                    <button type="button" onClick={applyCode} disabled={applying} className="btn-outline shrink-0 px-4 disabled:opacity-60">
                      {applying ? <i className="fa-solid fa-spinner fa-spin"></i> : "Apply"}
                    </button>
                  </div>
                  {couponMsg && <p className="mt-1.5 font-body text-xs text-danger">{couponMsg}</p>}
                </div>
              )}

              <div className="mt-5 space-y-2 border-t border-line pt-5 font-body text-sm">
                <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-mono text-ink">Rs. {subtotal.toLocaleString()}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between"><span className="text-muted">Discount{coupon?.code ? ` (${coupon.code})` : ""}</span><span className="font-mono text-brand-700">− Rs. {discount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="font-mono text-ink">{shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}</span></div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span className="font-display text-base font-semibold text-ink">Total</span>
                  <span className="font-display text-xl font-bold text-brand-700">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
