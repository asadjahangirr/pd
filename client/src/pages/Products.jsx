import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { products, categories } from "../data/products.js";

export default function Products() {
  const [params] = useSearchParams();
  const search = (params.get("search") || "").toLowerCase(); // from the navbar search
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");
  const [added, setAdded] = useState(null); // toast text

  // Filter + sort (recomputed only when inputs change)
  const shown = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat = cat === "All" || p.category === cat;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.short.toLowerCase().includes(search);
      return matchCat && matchSearch;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [cat, sort, search]);

  const handleAdd = (p) => {
    setAdded(p.name);
    setTimeout(() => setAdded(null), 2000);
    // TODO: connect to real cart state when we build the cart feature.
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ===== Page header ===== */}
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Shop</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">All Products</h1>
          <p className="mt-3 max-w-lg font-body text-sm text-muted">
            Dermatologist-formulated skincare, made for daily use.{" "}
            {search && (
              <>Showing results for <span className="font-semibold text-ink">“{search}”</span>.</>
            )}
          </p>
        </div>
      </section>

      {/* ===== Filter chips + sort (sticks under the navbar) ===== */}
      <section className="sticky top-20 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "chip-active" : ""}`}>
                {c}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-line bg-white px-4 py-2 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-200"
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
        <p className="mb-6 font-body text-sm text-muted">
          {shown.length} product{shown.length !== 1 ? "s" : ""}
        </p>

        {shown.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAdd} />
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

      {/* Add-to-cart toast */}
      {added && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 font-body text-sm text-white shadow-lg animate-[fade-up_0.3s_ease]">
          <i className="fa-solid fa-check mr-2 text-brand-300"></i>{added} added to cart
        </div>
      )}

      <Footer />
    </div>
  );
}