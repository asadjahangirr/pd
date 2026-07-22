import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createProduct, updateProduct, deleteProduct, reorderProducts, bulkDeleteProducts, bulkSetStock, fetchCategories, uploadImage } from "../api/admin.js";
import { productStatus } from "../lib/product.js";

const EMPTY = {
  name: "",
  category: "",
  price: "",
  costPrice: "",
  oldPrice: "",
  stock: "",
  image: "",
  image2: "",
  short: "",
  description: "",
};

export default function AdminProducts() {
  const { products, loading, error, reload } = useProducts();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [banner, setBanner] = useState("");
  const [uploading, setUploading] = useState(null); // which field is uploading
  const [uploadError, setUploadError] = useState("");
  const [reordering, setReordering] = useState(false);
  const [selected, setSelected] = useState(() => new Set());

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const canReorder = !search.trim();

  const flash = (msg) => {
    setBanner(msg);
    setTimeout(() => setBanner(""), 3000);
  };

  // If the token expired mid-action, send back to login.
  const handleAuthError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY, category: categories[0]?.name || "" });
    setFormError("");
    setUploadError("");
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      costPrice: p.costPrice ?? "",
      oldPrice: p.oldPrice ?? "",
      stock: p.stock ?? 0,
      image: p.image ?? "",
      image2: p.image2 ?? "",
      short: p.short ?? "",
      description: p.description ?? "",
    });
    setFormError("");
    setUploadError("");
    setModalOpen(true);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onPickImage = (field) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setUploading(field);
    setUploadError("");
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, [field]: url }));
    } catch (err) {
      if (!handleAuthError(err)) setUploadError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const renderUploader = (field, label, hint) => (
    <Field label={label} hint={hint}>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-brand-50">
          {form[field] ? (
            <img src={form[field]} alt="" className="max-h-full w-auto object-contain" />
          ) : (
            <i className="fa-solid fa-image text-brand-300"></i>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className={`inline-flex cursor-pointer items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 ${uploading === field ? "pointer-events-none opacity-60" : ""}`}>
            {uploading === field ? <><i className="fa-solid fa-spinner fa-spin mr-1.5"></i> Uploading…</> : <><i className="fa-solid fa-arrow-up-from-bracket mr-1.5"></i> Upload</>}
            <input type="file" accept="image/*" className="hidden" onChange={onPickImage(field)} disabled={uploading === field} />
          </label>
          <input value={form[field]} onChange={set(field)} className="review-input mt-2" placeholder="…or paste an image URL" />
        </div>
      </div>
    </Field>
  );

  const save = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.category || form.price === "") {
      setFormError("Name, category and price are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        costPrice: form.costPrice === "" ? 0 : Number(form.costPrice),
        oldPrice: form.oldPrice === "" ? null : Number(form.oldPrice),
        stock: Number(form.stock) || 0,
        image: form.image.trim(),
        image2: form.image2.trim(),
        short: form.short,
        description: form.description,
      };
      if (editingId) await updateProduct(editingId, payload);
      else await createProduct(payload);
      await reload();
      setModalOpen(false);
      flash(editingId ? "Product updated." : "Product added.");
    } catch (err) {
      if (!handleAuthError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(p.id);
      await reload();
      flash("Product deleted.");
    } catch (err) {
      if (!handleAuthError(err)) alert(err.message);
    }
  };

  const toggleFeatured = async (p) => {
    try {
      await updateProduct(p.id, { featured: !p.featured });
      await reload();
      flash(p.featured ? "Removed from Best Sellers." : "Added to Best Sellers.");
    } catch (err) {
      if (!handleAuthError(err)) alert(err.message);
    }
  };

  const move = async (p, dir) => {
    const list = [...products];
    const i = list.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setReordering(true);
    try {
      await reorderProducts(list.map((x) => x.id));
      await reload();
    } catch (err) {
      if (!handleAuthError(err)) alert(err.message);
    } finally {
      setReordering(false);
    }
  };

  // ---- Bulk selection ----
  const toggleSel = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const clearSel = () => setSelected(new Set());

  const bulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} product(s)? This can't be undone.`)) return;
    try {
      await bulkDeleteProducts(ids);
      clearSel();
      await reload();
      flash(`Deleted ${ids.length} product(s).`);
    } catch (err) {
      if (!handleAuthError(err)) alert(err.message);
    }
  };

  const bulkStock = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const val = window.prompt(`Set stock for ${ids.length} product(s) to:`, "0");
    if (val === null) return;
    const stock = Math.max(0, Number(val) || 0);
    try {
      await bulkSetStock(ids, stock);
      clearSel();
      await reload();
      flash(`Set stock to ${stock} for ${ids.length} product(s).`);
    } catch (err) {
      if (!handleAuthError(err)) alert(err.message);
    }
  };

  return (
    <AdminLayout title="Products">
      {banner && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 font-body text-sm text-brand-800">
          <i className="fa-solid fa-circle-check text-brand-600"></i> {banner}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 sm:w-72">
          <i className="fa-solid fa-magnifying-glass text-brand-500"></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-transparent font-body text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        <button onClick={openAdd} className="btn-primary justify-center">
          <i className="fa-solid fa-plus mr-2"></i> Add product
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i>
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="font-display text-lg text-ink">Couldn't load products</p>
          <button onClick={reload} className="btn-primary mt-4">Try again</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-body text-sm text-muted">
              {shown.length} product{shown.length !== 1 ? "s" : ""}
              <span className="ml-2 text-xs">· <i className="fa-solid fa-star text-accent"></i> = featured · ▲▼ to reorder{!canReorder ? " (clear search)" : ""}</span>
            </p>
            {shown.length > 0 && (
              <label className="inline-flex cursor-pointer items-center gap-2 font-body text-sm text-muted">
                <input
                  type="checkbox"
                  checked={shown.every((p) => selected.has(p.id))}
                  onChange={() =>
                    setSelected((s) => {
                      const n = new Set(s);
                      const all = shown.every((p) => n.has(p.id));
                      shown.forEach((p) => (all ? n.delete(p.id) : n.add(p.id)));
                      return n;
                    })
                  }
                  className="h-4 w-4 accent-brand-600"
                />
                Select all
              </label>
            )}
          </div>

          {selected.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
              <span className="font-body text-sm font-semibold text-brand-800">{selected.size} selected</span>
              <div className="flex flex-wrap gap-2">
                <button onClick={bulkStock} className="inline-flex items-center rounded-full border border-brand-300 bg-white px-3 py-1.5 font-body text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50">
                  <i className="fa-solid fa-layer-group mr-1.5"></i> Set stock
                </button>
                <button onClick={bulkDelete} className="inline-flex items-center rounded-full border border-danger/30 bg-white px-3 py-1.5 font-body text-xs font-semibold text-danger transition-colors hover:bg-danger/10">
                  <i className="fa-solid fa-trash-can mr-1.5"></i> Delete
                </button>
                <button onClick={clearSel} className="inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 font-body text-xs font-semibold text-muted transition-colors hover:bg-white">
                  Clear
                </button>
              </div>
            </div>
          )}
          {shown.map((p) => {
            const idx = products.findIndex((x) => x.id === p.id);
            return (
            <div key={p.id} className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center ${selected.has(p.id) ? "border-brand-400 ring-1 ring-brand-200" : "border-line"}`}>
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleSel(p.id)}
                aria-label={`Select ${p.name}`}
                className="h-4 w-4 shrink-0 accent-brand-600 sm:self-center"
              />
              {canReorder && (
                <div className="flex flex-row gap-1 sm:flex-col">
                  <button onClick={() => move(p, -1)} disabled={idx <= 0 || reordering} aria-label="Move up" className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:opacity-30">
                    <i className="fa-solid fa-chevron-up text-xs"></i>
                  </button>
                  <button onClick={() => move(p, 1)} disabled={idx >= products.length - 1 || reordering} aria-label="Move down" className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:opacity-30">
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </button>
                </div>
              )}
              {/* thumb */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                {p.image ? (
                  <img src={p.image} alt="" className="max-h-full w-auto object-contain" />
                ) : (
                  <i className="fa-solid fa-image text-brand-300"></i>
                )}
              </div>
              {/* info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-semibold text-ink">
                  {p.featured && <i className="fa-solid fa-star mr-1.5 text-accent" title="Featured on homepage"></i>}
                  {p.name}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-brand-500">{p.category}</p>
                <p className="mt-1 font-mono text-sm text-brand-700">
                  Rs. {p.price?.toLocaleString()}
                  {p.oldPrice ? <span className="ml-2 text-muted line-through">Rs. {p.oldPrice.toLocaleString()}</span> : null}
                </p>
              </div>
              {/* stock + badge */}
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <span className={`font-mono text-xs ${(p.stock || 0) === 0 ? "text-danger" : "text-muted"}`}>
                  Stock: <span className="font-bold">{p.stock ?? 0}</span>
                </span>
                {(() => {
                  const { soldOut, off } = productStatus(p);
                  return soldOut ? (
                    <span className="rounded-full bg-danger px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">Out</span>
                  ) : off > 0 ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">-{off}%</span>
                  ) : null;
                })()}
              </div>
              {/* actions */}
              <div className="flex gap-2">
                <button onClick={() => toggleFeatured(p)} title={p.featured ? "Remove from Best Sellers" : "Feature on homepage"} className={`inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold transition-colors hover:bg-brand-50 ${p.featured ? "text-accent" : "text-muted"}`}>
                  <i className={`fa-${p.featured ? "solid" : "regular"} fa-star`}></i>
                </button>
                <button onClick={() => openEdit(p)} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700">
                  <i className="fa-solid fa-pen mr-1.5"></i> Edit
                </button>
                <button onClick={() => remove(p)} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-danger transition-colors hover:bg-danger/10">
                  <i className="fa-solid fa-trash-can mr-1.5"></i> Delete
                </button>
              </div>
            </div>
            );
          })}
          {shown.length === 0 && (
            <div className="rounded-2xl border border-line bg-white p-10 text-center font-body text-sm text-muted">
              No products match your search.
            </div>
          )}
        </div>
      )}

      {/* ===== Add/Edit modal ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-80 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 py-10">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">
                {editingId ? "Edit product" : "Add product"}
              </h2>
              <button onClick={() => setModalOpen(false)} aria-label="Close" className="icon-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
                <i className="fa-solid fa-circle-exclamation"></i> {formError}
              </div>
            )}

            <form onSubmit={save} className="space-y-4">
              <Field label="Name">
                <input value={form.name} onChange={set("name")} className="review-input" placeholder="Product name" />
              </Field>

              <Field
                label="Category"
                hint="Badges are automatic: “Out of Stock” at 0 stock, and “-X%” when Old price is higher than Price."
              >
                <select value={form.category} onChange={set("category")} className="review-input">
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Selling price (Rs.)">
                  <input type="number" min="0" value={form.price} onChange={set("price")} className="review-input" placeholder="1750" />
                </Field>
                <Field label="Cost — what you paid (Rs.)">
                  <input type="number" min="0" value={form.costPrice} onChange={set("costPrice")} className="review-input" placeholder="0" />
                </Field>
                <Field label="Old price (for discount)">
                  <input type="number" min="0" value={form.oldPrice} onChange={set("oldPrice")} className="review-input" placeholder="—" />
                </Field>
                <Field label="Stock (pieces)">
                  <input type="number" min="0" value={form.stock} onChange={set("stock")} className="review-input" placeholder="0" />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {renderUploader("image", "Main image", "Shown by default everywhere.")}
                {renderUploader("image2", "Hover image", "Shown on hover (optional).")}
              </div>
              {uploadError && <p className="font-body text-xs text-danger">{uploadError}</p>}

              <Field label="Short description">
                <input value={form.short} onChange={set("short")} className="review-input" placeholder="One-line summary" />
              </Field>

              <Field label="Full description">
                <textarea rows={3} value={form.description} onChange={set("description")} className="review-input" placeholder="Detailed description…" />
              </Field>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="inline-flex items-center rounded-full border border-line px-5 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:bg-brand-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving…</> : <><i className="fa-solid fa-check mr-2"></i>{editingId ? "Save changes" : "Add product"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-brand-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-body text-xs text-muted">{hint}</span>}
    </label>
  );
}
