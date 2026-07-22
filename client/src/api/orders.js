const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Place a Cash-on-Delivery order. payload = { customer, items:[{id, qty}] }
export async function placeOrder(payload) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Could not place order (${res.status})`);
  return data;
}

// Track an order by number + phone (public).
export async function trackOrder(orderNumber, phone) {
  const res = await fetch(`${API_URL}/api/orders/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber, phone }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not find your order");
  return data;
}
