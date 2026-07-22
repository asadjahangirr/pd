import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../api/admin.js";

export default function AdminCategories() {
  const { logout } = useAuth();
  const { products, reload: reloadProducts } = useProducts();
  const navigate = useNavigate();

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  const load = () => {
    setLoading(true);
    fetchCategories()
      .then(setCats)
      .catch(() => setError("Couldn't load categories"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

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

  const countFor = (name) => products.filter((p) => p.category === name).length;

  const add = async (e) => {
    e.preventDefault();
    setError("");
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      await createCategory({ name });
      setNewName("");
      load();
      flash("Category added.");
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async (c) => {
    const name = editName.trim();
    if (!name || name === c.name) {
      setEditingId(null);
      return;
    }
    setError("");
    try {
      await updateCategory(c.id, { name });
      setEditingId(null);
      load();
      await reloadProducts(); // renamed category cascades to products
      flash("Category renamed.");
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  const toggleVisible = async (c) => {
    setError("");
    try {
      await updateCategory(c.id, { visible: !c.visible });
      load();
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    setError("");
    try {
      await deleteCategory(c.id);
      load();
      flash("Category deleted.");
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  return (
    <AdminLayout title="Categories">
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

      {/* Add category */}
      <form onSubmit={add} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="review-input sm:max-w-xs"
        />
        <button disabled={adding} className="btn-primary justify-center disabled:opacity-60">
          <i className="fa-solid fa-plus mr-2"></i> Add category
        </button>
      </form>

      {loading ? (
        <div className="py-16 text-center">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i>
        </div>
      ) : (
        <div className="space-y-3">
          {cats.map((c) => {
            const count = countFor(c.name);
            const isEditing = editingId === c.id;
            return (
              <div key={c.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4 ${!c.visible ? "opacity-60" : ""}`}>
                {isEditing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(c); if (e.key === "Escape") setEditingId(null); }}
                    autoFocus
                    className="review-input flex-1 sm:max-w-xs"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                      {c.name}
                      {!c.visible && (
                        <span className="rounded-full bg-line px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-muted">Hidden</span>
                      )}
                    </p>
                    <p className="font-mono text-xs text-muted">{count} product{count !== 1 ? "s" : ""}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(c)} className="inline-flex items-center rounded-full bg-brand-600 px-3 py-1.5 font-body text-xs font-semibold text-white transition-colors hover:bg-brand-700">
                        <i className="fa-solid fa-check mr-1.5"></i> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-brand-50">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(c.id); setEditName(c.name); }} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700">
                        <i className="fa-solid fa-pen mr-1.5"></i> Rename
                      </button>
                      <button onClick={() => toggleVisible(c)} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700">
                        <i className={`fa-solid ${c.visible ? "fa-eye-slash" : "fa-eye"} mr-1.5`}></i> {c.visible ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => remove(c)} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 font-body text-xs font-semibold text-danger transition-colors hover:bg-danger/10">
                        <i className="fa-solid fa-trash-can mr-1.5"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {cats.length === 0 && (
            <div className="rounded-2xl border border-line bg-white p-10 text-center font-body text-sm text-muted">
              No categories yet — add one above.
            </div>
          )}
        </div>
      )}

      <p className="mt-6 font-body text-xs text-muted">
        <i className="fa-solid fa-circle-info mr-1.5 text-brand-400"></i>
        Hiding a category removes its filter chip from the shop. A category can't be deleted while products still use it.
      </p>
    </AdminLayout>
  );
}
