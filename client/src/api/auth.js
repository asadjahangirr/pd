// ============================================================
//  Admin auth API calls. Base URL from client/.env (VITE_API_URL).
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// POST credentials, get back { token, username }
export async function loginRequest(username, password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Login failed (${res.status})`);
  return data;
}
