import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useProducts } from "../context/ProductsContext.jsx";

export default function Products() {
  const { products, categories, loading, error, reload } = useProducts();
  // filter chips: "All" + only the categories marked visible
  const catNames = ["All", ...categories.filter((c) => c.visible).map((c) => c.name)];
  const [params, setParams] = useSearchParams();
  const rawSearch = params.get("search") || "";           // original text (for display)
  const search = rawSearch.toLowerCase();                  // lowercased (for matching)
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");

  // Filter + fuzzy search + sort (recomputed only when inputs change)
  const shown = useMemo(() => {
    // 1) category filter
    let list = products.filter((p) => cat === "All" || p.category === cat);

    // 2) fuzzy search — "ace" finds "Acneca", tolerates typos/partial words
    if (search) {
      const fuse = new Fuse(list, {
        keys: [
          { name: "name", weight: 3 },
          { name: "category", weight: 2 },
          { name: "short", weight: 1 },
          { name: "description", weight: 1 },
        ],
        threshold: 0.45,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });
      list = fuse.search(search).map((r) => r.item);
    }

    // 3) sort (a chosen sort overrides relevance/feature order)
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, cat, sort, search]);

  const clearSearch = () => setParams({}); // removes ?search= from the URL

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ===== Page header ===== */}
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Shop</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">All Products</h1>
          <p className="mt-3 max-w-lg font-body text-sm text-muted">
            Dermatologist-formulated skincare, made for daily use.
          </p>
        </div>
      </section>

      {/* ===== Filter chips + sort (sticks under the navbar) ===== */}
      <section className="border-b border-line bg-white/90 backdrop-blur sm:sticky sm:top-20 sm:z-30">
        {/* Active-search pill with a clear (x) button */}
        {rawSearch && (
          <div className="mx-auto max-w-7xl px-5 pt-4 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 font-body text-sm text-brand-800">
              Showing results for <span className="font-semibold">“{rawSearch}”</span>
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </span>
          </div>
        )}

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {catNames.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "chip-active" : ""}`}>
                {c}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-full border border-line bg-white px-4 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-200 sm:w-auto"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="az">Alphabetically A–Z</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </section>

      {/* ===== Product grid ===== */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {!loading && !error && (
          <p className="mb-6 font-body text-sm text-muted">
            {shown.length} product{shown.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <i className="fa-solid fa-spinner fa-spin mb-4 text-3xl text-brand-400"></i>
            <p className="font-body text-sm text-muted">Loading products…</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <i className="fa-solid fa-triangle-exclamation mb-4 text-4xl text-danger"></i>
            <p className="font-display text-xl text-ink">Couldn't load products</p>
            <p className="mt-2 font-body text-sm text-muted">{error}</p>
            <button onClick={reload} className="btn-primary mt-6">
              <i className="fa-solid fa-rotate-right mr-2"></i> Try again
            </button>
          </div>
        ) : shown.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <i className="fa-regular fa-face-frown mb-4 text-4xl text-brand-300"></i>
            <p className="font-display text-xl text-ink">No products found</p>
            <p className="mt-2 font-body text-sm text-muted">Try a different category or search term.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}