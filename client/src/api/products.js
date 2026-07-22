// ============================================================
//  Talks to the Express backend for product data.
//  The base URL comes from client/.env (VITE_API_URL) so it can
//  point at localhost in dev and your real server in production.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// GET all products (no-store so we never show a stale/empty cached list)
export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load products (${res.status})`);
  return res.json();
}

// GET one product by its slug id (returns null if not found)
export async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Could not load product (${res.status})`);
  return res.json();
}
