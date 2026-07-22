import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSiteContent } from "../context/SiteContentContext.jsx";
import { updateContentText } from "../api/admin.js";

const GROUPS = [
  {
    title: "Business info",
    hint: "Shown in the navbar, footer, and Contact page.",
    fields: [
      { key: "brandName", label: "Store name", type: "input" },
      { key: "phone", label: "Phone (WhatsApp)", type: "input" },
      { key: "email", label: "Email", type: "input" },
      { key: "address", label: "Address", type: "input" },
    ],
  },
  {
    title: "Homepage — Hero slide 1",
    fields: [
      { key: "hero1_eyebrow", label: "Small label", type: "input" },
      { key: "hero1_title", label: "Headline", type: "input" },
      { key: "hero1_text", label: "Description", type: "textarea" },
    ],
  },
  {
    title: "Homepage — Hero slide 2",
    fields: [
      { key: "hero2_eyebrow", label: "Small label", type: "input" },
      { key: "hero2_title", label: "Headline", type: "input" },
      { key: "hero2_text", label: "Description", type: "textarea" },
    ],
  },
  {
    title: "Homepage — Hero slide 3",
    fields: [
      { key: "hero3_eyebrow", label: "Small label", type: "input" },
      { key: "hero3_title", label: "Headline", type: "input" },
      { key: "hero3_text", label: "Description", type: "textarea" },
    ],
  },
  {
    title: "About page",
    fields: [
      { key: "about_title", label: "Hero title", type: "input" },
      { key: "about_subtitle", label: "Hero subtitle", type: "textarea" },
      { key: "about_who_heading", label: "Section heading", type: "input" },
      { key: "about_who_p1", label: "Paragraph 1", type: "textarea" },
      { key: "about_who_p2", label: "Paragraph 2", type: "textarea" },
    ],
  },
];

export default function AdminContent() {
  const { text, reload } = useSiteContent();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({ ...text }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const handleAuthError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateContentText(form);
      await reload();
      setBanner("Saved — applied across the store.");
      setTimeout(() => setBanner(""), 3000);
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Site text">
      {banner && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 font-body text-sm text-brand-800">
          <i className="fa-solid fa-circle-check text-brand-600"></i> {banner}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
          <span><i className="fa-solid fa-circle-exclamation mr-1.5"></i> {error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss"><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="space-y-5">
        {GROUPS.map((g) => (
          <div key={g.title} className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-ink">{g.title}</h2>
            {g.hint && <p className="mt-0.5 font-body text-xs text-muted">{g.hint}</p>}
            <div className="mt-4 space-y-4">
              {g.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-brand-500">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea rows={2} value={form[f.key] ?? ""} onChange={set(f.key)} className="review-input" />
                  ) : (
                    <input value={form[f.key] ?? ""} onChange={set(f.key)} className="review-input" />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center py-3 disabled:opacity-60 sm:w-auto sm:px-8">
          {saving ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving…</> : <><i className="fa-solid fa-check mr-2"></i>Save all text</>}
        </button>
      </div>
    </AdminLayout>
  );
}
