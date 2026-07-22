import { createContext, useContext, useState, useEffect } from "react";

/* ============================================================
   THE CART "BRAIN" — one shared source of truth.
   Any component can read the cart or change it via useCart().
   Saves to the browser (localStorage) so it survives refresh.
   Later: sync to a logged-in account through the backend.
   ============================================================ */

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "delight_cart";
const COUPON_KEY = "delight_coupon";

export function CartProvider({ children }) {
  // Load any saved cart on first render
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Applied coupon meta { code, type, value, minSubtotal } — persisted too
  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist the cart whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore storage errors */
    }
  }, [items]);

  // Persist the applied coupon
  useEffect(() => {
    try {
      if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, [coupon]);

  // --- Actions ---
  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, image: product.image, qty },
      ];
    });
    setDrawerOpen(true); // slide the drawer open as confirmation
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty } : i))
        .filter((i) => i.qty > 0) // qty 0 removes the item
    );

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (c) => setCoupon(c);
  const removeCoupon = () => setCoupon(null);

  // --- Derived totals ---
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  // Discount from the applied coupon (recomputed as the cart changes)
  const discount = (() => {
    if (!coupon) return 0;
    if (subtotal < (coupon.minSubtotal || 0)) return 0; // no longer meets the minimum
    const raw = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    return Math.max(0, Math.min(raw, subtotal));
  })();

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQty, clearCart,
        count, subtotal, discount,
        coupon, applyCoupon, removeCoupon,
        drawerOpen, setDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}