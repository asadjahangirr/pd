import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSiteContent } from "../context/SiteContentContext.jsx";
import { uploadImage, updateContent } from "../api/admin.js";

const SLOTS = [
  { key: "logo", label: "Logo", hint: "Top-left of the navbar. A transparent PNG looks best.", box: "h-24" },
  { key: "hero1", label: "Hero slide 1", hint: "Homepage top slideshow.", box: "aspect-square" },
  { key: "hero2", label: "Hero slide 2", hint: "Homepage top slideshow.", box: "aspect-square" },
  { key: "hero3", label: "Hero slide 3", hint: "Homepage top slideshow.", box: "aspect-square" },
  { key: "about", label: "About page photo", hint: "The photo on the About page.", box: "aspect-[4/3]" },
];

export default function AdminMedia() {
  const { images, reload } = useSiteContent();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(null); // which slot is uploading
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

  const flash = (m) => {
    setBanner(m);
    setTimeout(() => setBanner(""), 3000);
  };

  const onPick = (slot) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(slot);
    setError("");
    try {
      const { url } = await uploadImage(file);
      await updateContent({ [slot]: url });
      await reload();
      flash("Image updated.");
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout title="Site images">
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

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {SLOTS.map((s) => (
          <div key={s.key} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-display text-base font-semibold text-ink">{s.label}</p>
            <p className="mt-0.5 font-body text-xs text-muted">{s.hint}</p>

            <div className={`mt-3 flex ${s.box} w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-brand-50`}>
              {images[s.key] ? (
                <img src={images[s.key]} alt="" className="max-h-full max-w-full object-contain" />
              ) : (
                <i className="fa-solid fa-image text-2xl text-brand-300"></i>
              )}
            </div>

            <label className={`mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-line px-4 py-2 font-body text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 ${busy === s.key ? "pointer-events-none opacity-60" : ""}`}>
              {busy === s.key ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Uploading…</>
              ) : (
                <><i className="fa-solid fa-arrow-up-from-bracket mr-2"></i> Change image</>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onPick(s.key)} disabled={busy === s.key} />
            </label>
          </div>
        ))}
      </div>

      <p className="mt-6 font-body text-xs text-muted">
        <i className="fa-solid fa-circle-info mr-1.5 text-brand-400"></i>
        Changes apply to the live storefront immediately. Uploaded images are hosted on Cloudinary.
      </p>
    </AdminLayout>
  );
}
