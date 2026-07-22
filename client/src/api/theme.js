const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "delight_admin_token";

// Public — the active theme.
export async function fetchTheme() {
  const res = await fetch(`${API_URL}/api/theme`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load theme");
  return res.json();
}

// Admin — save the theme.
export async function saveTheme(body) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_URL}/api/theme`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Could not save theme");
    err.status = res.status;
    throw err;
  }
  return data;
}
