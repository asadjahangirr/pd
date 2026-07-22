// ============================================================
//  Admin (write) API calls. These attach the saved JWT so the
//  backend allows them. Reads (products/categories list) can be
//  public, but we keep category reads here too for convenience.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "delight_admin_token";

function authHeaders(json = true) {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---- Products ---- */
export function createProduct(body) {
  return fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function updateProduct(id, body) {
  return fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function deleteProduct(id) {
  return fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  }).then(handle);
}

export function reorderProducts(ids) {
  return fetch(`${API_URL}/api/products/reorder`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  }).then(handle);
}

export function bulkDeleteProducts(ids) {
  return fetch(`${API_URL}/api/products/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  }).then(handle);
}

export function bulkSetStock(ids, stock) {
  return fetch(`${API_URL}/api/products/bulk-stock`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids, stock }),
  }).then(handle);
}

/* ---- Image upload ---- */
export function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);
  return fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: authHeaders(false), // no JSON header — the browser sets multipart boundary
    body: fd,
  }).then(handle);
}

/* ---- Site content (images) ---- */
export function fetchContent() {
  return fetch(`${API_URL}/api/content`, { cache: "no-store" }).then(handle);
}

export function updateContent(images) {
  return fetch(`${API_URL}/api/content`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ images }),
  }).then(handle);
}

export function updateContentText(text) {
  return fetch(`${API_URL}/api/content`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  }).then(handle);
}

/* ---- Orders ---- */
export function fetchOrders() {
  return fetch(`${API_URL}/api/orders`, { cache: "no-store", headers: authHeaders(false) }).then(handle);
}

export function updateOrderStatus(id, status) {
  return fetch(`${API_URL}/api/orders/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  }).then(handle);
}

export function deleteOrder(id) {
  return fetch(`${API_URL}/api/orders/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  }).then(handle);
}

/* ---- Contact messages (inbox) ---- */
export function fetchMessages() {
  return fetch(`${API_URL}/api/messages`, { cache: "no-store", headers: authHeaders(false) }).then(handle);
}

export function updateMessage(id, body) {
  return fetch(`${API_URL}/api/messages/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function deleteMessage(id) {
  return fetch(`${API_URL}/api/messages/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  }).then(handle);
}

/* ---- Expenses ---- */
export function fetchExpenses() {
  return fetch(`${API_URL}/api/expenses`, { cache: "no-store", headers: authHeaders(false) }).then(handle);
}

export function createExpense(body) {
  return fetch(`${API_URL}/api/expenses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function deleteExpense(id) {
  return fetch(`${API_URL}/api/expenses/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  }).then(handle);
}

/* ---- Coupons ---- */
export function fetchCoupons() {
  return fetch(`${API_URL}/api/coupons`, { cache: "no-store", headers: authHeaders(false) }).then(handle);
}

export function createCoupon(body) {
  return fetch(`${API_URL}/api/coupons`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function updateCoupon(id, body) {
  return fetch(`${API_URL}/api/coupons/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function deleteCoupon(id) {
  return fetch(`${API_URL}/api/coupons/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  }).then(handle);
}

/* ---- Categories ---- */
export function fetchCategories() {
  return fetch(`${API_URL}/api/categories`, { cache: "no-store" }).then(handle);
}

export function createCategory(body) {
  return fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function updateCategory(id, body) {
  return fetch(`${API_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then(handle);
}

export function deleteCategory(id) {
  return fetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(false),
  }).then(handle);
}
