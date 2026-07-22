import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { validateCoupon } from "../api/coupons.js";

const FREE_SHIPPING = 2500;
const SHIPPING_COST = 200;

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, count, clearCart, discount, coupon, applyCoupon, removeCoupon } = useCart();
  const { products } = useProducts();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");

  const shipping = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping - discount;

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
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  // Suggest products that aren't already in the cart and are in stock
  const suggestions = products.filter((p) => !items.find((i) => i.id === p.id) && (p.stock ?? 0) > 0).slice(0, 4);

  // ----- Empty state -----
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-5 py-28 text-center">
          <i className="fa-solid fa-basket-shopping mb-5 text-5xl text-brand-200"></i>
          <h1 className="font-display text-3xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-3 font-body text-sm text-muted">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary mt-8 inline-flex">Start shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Your Cart</h1>
          <p className="mt-2 font-body text-sm text-muted">{count} item{count !== 1 ? "s" : ""} in your cart</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* ===== Items ===== */}
          <div className="lg:col-span-2">
            {/* Free-shipping bar */}
            <div className="mb-6 rounded-2xl border border-line bg-mist p-4">
              {remaining > 0 ? (
                <p className="font-body text-sm text-muted">
                  You're <span className="font-semibold text-ink">Rs. {remaining.toLocaleString()}</span> away from free shipping
                </p>
              ) : (
                <p className="font-body text-sm text-brand-700"><i className="fa-solid fa-truck-fast mr-1"></i> You've unlocked free shipping!</p>
              )}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${pct}%` }}></div>
              </div>
            </div>

            <div className="rounded-2xl border border-line">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-line p-5 last:border-0">
                  <Link to={`/products/${item.id}`} className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-brand-50 p-2">
                    <img src={item.image} alt={item.name} className="max-h-full w-auto object-contain" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link to={`/products/${item.id}`} className="font-display text-base font-semibold text-ink hover:text-brand-700">{item.name}</Link>
                      <button onClick={() => removeItem(item.id)} className="text-muted transition-colors hover:text-danger" aria-label="Remove"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                    <p className="mt-1 font-mono text-sm text-brand-700">Rs. {item.price.toLocaleString()}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="qty-btn" aria-label="Decrease">–</button>
                        <span className="w-10 text-center font-mono text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="qty-btn" aria-label="Increase">+</button>
                      </div>
                      <span className="font-mono text-base font-bold text-ink">Rs. {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <Link to="/products" className="btn-ghost"><i className="fa-solid fa-arrow-left mr-2 text-xs"></i> Continue shopping</Link>
              <button onClick={clearCart} className="font-body text-sm text-muted transition-colors hover:text-danger">Clear cart</button>
            </div>
          </div>

          {/* ===== Order summary ===== */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-line bg-white p-6 shadow-[0_18px_50px_rgba(23,36,31,0.06)]">
              <h2 className="font-display text-xl font-semibold text-ink">Order Summary</h2>

              {/* Coupon */}
              {coupon && discount > 0 ? (
                <div className="mt-5 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
                  <span className="font-body text-sm text-brand-800">
                    <i className="fa-solid fa-tag mr-1.5 text-brand-600"></i>
                    <span className="font-mono font-semibold">{coupon.code}</span> applied
                  </span>
                  <button onClick={removeCoupon} className="font-body text-xs font-semibold text-muted transition-colors hover:text-danger">Remove</button>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyCode()}
                      placeholder="Promo code"
                      className="review-input"
                    />
                    <button onClick={applyCode} disabled={applying} className="btn-outline shrink-0 px-4 disabled:opacity-60">
                      {applying ? <i className="fa-solid fa-spinner fa-spin"></i> : "Apply"}
                    </button>
                  </div>
                  {couponMsg && <p className="mt-1.5 font-body text-xs text-danger">{couponMsg}</p>}
                </div>
              )}

              <div className="mt-5 space-y-3 border-t border-line pt-5 font-body text-sm">
                <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-mono text-ink">Rs. {subtotal.toLocaleString()}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between"><span className="text-muted">Discount{coupon?.code ? ` (${coupon.code})` : ""}</span><span className="font-mono text-brand-700">− Rs. {discount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="font-mono text-ink">{shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}</span></div>
                <div className="flex justify-between border-t border-line pt-3 text-base"><span className="font-semibold text-ink">Total</span><span className="font-mono text-lg font-bold text-brand-700">Rs. {total.toLocaleString()}</span></div>
              </div>

              {/* TODO: build the /checkout page next */}
              <Link to="/checkout" className="btn-primary mt-6 w-full">Proceed to Checkout</Link>
              <p className="mt-3 text-center font-body text-xs text-muted"><i className="fa-solid fa-lock mr-1"></i> Secure checkout</p>
            </div>
          </div>
        </div>

        {/* ===== You may also like ===== */}
        {suggestions.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 font-display text-2xl font-semibold text-ink">You may also like</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}