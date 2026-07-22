const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Send a contact-form message (public).
export async function submitMessage(payload) {
  const res = await fetch(`${API_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not send your message");
  return data;
}
