import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const DEFAULT_PRIMARY = "#226f51";
const DEFAULT_ACCENT = "#d98a4e";

// primary = the main brand colour (buttons, links, sidebar, prices…)
const PRIMARY_SWATCHES = ["#226f51", "#0d9488", "#0e7490", "#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#db2777", "#e11d48", "#dc2626", "#ea580c", "#b45309"];
// accent = highlights (discount badges, "new" counts, featured star…)
const ACCENT_SWATCHES = ["#d98a4e", "#f59e0b", "#eab308", "#f97316", "#ef4444", "#ec4899", "#a855f7", "#3b82f6", "#06b6d4", "#10b981", "#84cc16", "#64748b"];

const PRESETS = [
  { id: "pine", name: "Pine (Original)", primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT, reset: true },
  { id: "ocean", name: "Ocean Blue", primary: "#1d6fb0", accent: "#f59e0b" },
  { id: "violet", name: "Royal Violet", primary: "#7c3aed", accent: "#ec4899" },
  { id: "terracotta", name: "Terracotta", primary: "#b45309", accent: "#0d9488" },
  { id: "slate", name: "Graphite", primary: "#3f4d5c", accent: "#e0894a" },
];

export default function AdminAppearance() {
  const { theme, preview, applySaved, save } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [useDefault, setUseDefault] = useState(!theme.primary);
  const [primary, setPrimary] = useState(theme.primary || DEFAULT_PRIMARY);
  const [accent, setAccent] = useState(theme.accent || DEFAULT_ACCENT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  // keep the latest saved theme so we can revert on leave
  const savedRef = useRef(theme);
  savedRef.current = theme;

  // Live preview as selections change
  useEffect(() => {
    if (useDefault) preview("", "");
    else preview(primary, accent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDefault, primary, accent]);

  // On leaving without saving, revert to the saved theme
  useEffect(() => {
    return () => {
      const t = savedRef.current;
      preview(t.primary, t.accent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (m) => {
    setBanner(m);
    setTimeout(() => setBanner(""), 3000);
  };
  const handleAuthError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };

  const pickPrimary = (hex) => {
    setUseDefault(false);
    setPrimary(hex);
  };
  const pickAccent = (hex) => {
    setUseDefault(false);
    setAccent(hex);
  };
  const applyPreset = (p) => {
    if (p.reset) {
      setUseDefault(true);
      setPrimary(DEFAULT_PRIMARY);
      setAccent(DEFAULT_ACCENT);
    } else {
      setUseDefault(false);
      setPrimary(p.primary);
      setAccent(p.accent);
    }
  };

  const doSave = async () => {
    setSaving(true);
    setError("");
    try {
      await save(useDefault ? "" : primary, useDefault ? "" : accent);
      flash("Theme saved — applied across the whole store.");
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetDefault = () => {
    setUseDefault(true);
    setPrimary(DEFAULT_PRIMARY);
    setAccent(DEFAULT_ACCENT);
  };

  const isPresetActive = (p) =>
    p.reset ? useDefault : !useDefault && primary.toLowerCase() === p.primary && accent.toLowerCase() === p.accent;

  return (
    <AdminLayout title="Appearance">
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

      <p className="mb-6 font-body text-sm text-muted">
        <i className="fa-solid fa-wand-magic-sparkles mr-1.5 text-brand-400"></i>
        Colours preview live everywhere as you pick. Click <b>Save</b> to apply them for all customers.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Presets */}
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Preset themes</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${isPresetActive(p) ? "border-brand-500 ring-1 ring-brand-200" : "border-line hover:bg-brand-50"}`}
                >
                  <span className="flex -space-x-2">
                    <span className="h-7 w-7 rounded-full border-2 border-white" style={{ backgroundColor: p.primary }}></span>
                    <span className="h-7 w-7 rounded-full border-2 border-white" style={{ backgroundColor: p.accent }}></span>
                  </span>
                  <span className="font-body text-sm font-semibold text-ink">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary */}
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Primary colour</h2>
            <p className="mt-0.5 font-body text-xs text-muted">Buttons, links, navbar, footer, prices, sidebar.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {PRIMARY_SWATCHES.map((hex) => (
                <button key={hex} onClick={() => pickPrimary(hex)} aria-label={hex} style={{ backgroundColor: hex }}
                  className={`h-9 w-9 rounded-full transition ${!useDefault && primary.toLowerCase() === hex ? "scale-110 ring-2 ring-ink ring-offset-2" : "shadow"}`}></button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input type="color" value={primary} onChange={(e) => pickPrimary(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" />
              <span className="font-mono text-sm text-muted">Custom / shade: <span className="font-semibold text-ink">{useDefault ? "default" : primary}</span></span>
            </div>
          </div>

          {/* Accent */}
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Secondary (accent) colour</h2>
            <p className="mt-0.5 font-body text-xs text-muted">Discount badges, "new" counts, the featured ★ star.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {ACCENT_SWATCHES.map((hex) => (
                <button key={hex} onClick={() => pickAccent(hex)} aria-label={hex} style={{ backgroundColor: hex }}
                  className={`h-9 w-9 rounded-full transition ${!useDefault && accent.toLowerCase() === hex ? "scale-110 ring-2 ring-ink ring-offset-2" : "shadow"}`}></button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input type="color" value={accent} onChange={(e) => pickAccent(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" />
              <span className="font-mono text-sm text-muted">Custom / shade: <span className="font-semibold text-ink">{useDefault ? "default" : accent}</span></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={doSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving…</> : <><i className="fa-solid fa-check mr-2"></i>Save theme</>}
            </button>
            <button onClick={resetDefault} className="inline-flex items-center rounded-full border border-line px-5 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:bg-brand-50">
              <i className="fa-solid fa-rotate-left mr-2"></i> Reset to default
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Live preview</h2>
            <p className="mt-0.5 font-body text-xs text-muted">The whole site updates like this.</p>

            <div className="mt-4 space-y-4">
              <button className="btn-primary w-full justify-center">Add to Cart</button>
              <button className="btn-outline w-full justify-center">Buy Now</button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-white">-20%</span>
                <span className="rounded-full bg-danger px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-white">Out of stock</span>
                <span className="chip chip-active">Category</span>
                <i className="fa-solid fa-star text-accent"></i>
              </div>

              <div className="rounded-xl border border-line p-3">
                <div className="flex h-20 items-center justify-center rounded-lg bg-brand-50">
                  <i className="fa-solid fa-bottle-droplet text-2xl text-brand-300"></i>
                </div>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-brand-500">Serums</p>
                <p className="font-display text-sm font-semibold text-ink">Sample Product</p>
                <p className="font-mono text-sm font-bold text-brand-700">Rs. 1,750</p>
              </div>

              <div className="rounded-xl bg-brand-900 p-3 text-center">
                <span className="font-display text-sm font-semibold text-white">Footer / sidebar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
