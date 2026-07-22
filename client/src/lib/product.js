/* Derived product status used across the storefront.
   - soldOut: true when stock is 0 (or missing) -> shows "Out of Stock"
   - off:     discount % when there's a higher old price -> shows "-X%"
   These are computed, not stored, so badges stay correct automatically. */
export function productStatus(p) {
  const soldOut = (p?.stock ?? 0) <= 0;
  const off =
    p?.oldPrice && p.oldPrice > p.price
      ? Math.round((1 - p.price / p.oldPrice) * 100)
      : 0;
  return { soldOut, off };
}
