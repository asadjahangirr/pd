const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Validate a coupon against a subtotal. Returns { code, type, value, minSubtotal, discount }.
export async function validateCoupon(code, subtotal) {
  const res = await fetch(`${API_URL}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Invalid coupon");
  return data;
}
