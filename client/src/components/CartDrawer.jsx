import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const FREE_SHIPPING = 2500; // Rs. threshold for free shipping

export default function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, updateQty, removeItem, subtotal, count } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[60] bg-ink/40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      ></div>

      {/* Sliding panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl font-semibold text-ink">
            Your Cart <span className="font-mono text-sm text-muted">({count})</span>
          </h2>
          <button onClick={() => setDrawerOpen(false)} aria-label="Close cart" className="icon-btn">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <i className="fa-solid fa-basket-shopping text-4xl text-brand-200"></i>
            <p className="font-display text-lg text-ink">Your cart is empty</p>
            <Link to="/products" onClick={() => setDrawerOpen(false)} className="btn-primary">Shop products</Link>
          </div>
        ) : (
          <>
            {/* Free-shipping progress */}
            <div className="border-b border-line px-6 py-4">
              {remaining > 0 ? (
                <p className="font-body text-xs text-muted">
                  You're <span className="font-semibold text-ink">Rs. {remaining.toLocaleString()}</span> away from free shipping
                </p>
              ) : (
                <p className="font-body text-xs text-brand-700">
                  <i className="fa-solid fa-truck-fast mr-1"></i> You've unlocked free shipping!
                </p>
              )}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${pct}%` }}></div>
              </div>
            </div>

            {/* Items (scrolls) */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-line py-4 last:border-0">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-brand-50 p-2">
                    <img src={item.image} alt={item.name} className="max-h-full w-auto object-contain" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-body text-sm font-medium text-ink">{item.name}</p>
                      <button onClick={() => removeItem(item.id)} aria-label="Remove" className="text-muted transition-colors hover:text-danger">
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-sm text-brand-700">Rs. {item.price.toLocaleString()}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-line">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="h-8 w-8 text-brand-700" aria-label="Decrease">–</button>
                        <span className="w-8 text-center font-mono text-xs">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="h-8 w-8 text-brand-700" aria-label="Increase">+</button>
                      </div>
                      <span className="font-mono text-sm font-semibold text-ink">Rs. {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-muted">Subtotal</span>
                <span className="font-mono text-lg font-bold text-ink">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/cart" onClick={() => setDrawerOpen(false)} className="btn-outline flex-1">View cart</Link>
                <Link to="/checkout" onClick={() => setDrawerOpen(false)} className="btn-primary flex-1">Checkout</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}