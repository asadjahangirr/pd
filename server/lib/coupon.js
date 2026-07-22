/* Shared coupon validation + discount math (used by the coupons route and
   the orders route so they agree). */

export function couponError(coupon, subtotal) {
  if (!coupon) return "Invalid coupon code";
  if (!coupon.active) return "This coupon is not active";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "This coupon has expired";
  if (subtotal < (coupon.minSubtotal || 0)) return `Minimum order of Rs. ${coupon.minSubtotal} required`;
  return null;
}

export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  const raw = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.max(0, Math.min(raw, subtotal));
}
