import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import StarRating from "../components/StarRating.jsx";
import { getProductById, products } from "../data/products.js";

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState(product?.reviews || []);
  const [form, setForm] = useState({ name: "", rating: 0, text: "" });

  // When navigating between products, scroll up and reset local state.
  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setAdded(false);
    setForm({ name: "", rating: 0, text: "" });
    setReviews(getProductById(id)?.reviews || []);
  }, [id]);

  // Product doesn't exist (bad URL)
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <h1 className="font-display text-3xl text-ink">Product not found</h1>
          <Link to="/products" className="btn-primary mt-6 inline-flex">Back to all products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const soldOut = product.badge === "out";
  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;

  const addToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    // TODO: connect to real cart state later.
  };

  const submitReview = () => {
    if (!form.name.trim() || !form.rating || !form.text.trim()) return;
    setReviews([{ ...form, date: "Just now" }, ...reviews]);
    setForm({ name: "", rating: 0, text: "" });
    // TODO: POST the review (with optional image) to the backend later.
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
        <nav className="font-body text-xs text-muted">
          <Link to="/" className="hover:text-brand-700">Home</Link> <span className="mx-1">/</span>
          <Link to="/products" className="hover:text-brand-700">Products</Link> <span className="mx-1">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      {/* ===== Main product ===== */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-2 lg:px-8">
        {/* Image */}
        <div className="relative flex items-center justify-center rounded-4xl border border-line bg-brand-50 p-10">
          {product.badge === "discount" && off > 0 && (
            <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 font-mono text-xs font-bold text-white">-{off}%</span>
          )}
          {soldOut && (
            <span className="absolute left-5 top-5 rounded-full bg-danger px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-white">Out of Stock</span>
          )}
          {/* ADD IMAGE (transparent PNG) */}
          <img src={product.image} alt={product.name} className="max-h-105 w-auto object-contain animate-[slow-float_6s_ease-in-out_infinite]" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-500">{product.category}</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <StarRating value={avg} />
            <span className="font-body text-sm text-muted">{avg.toFixed(1)} · {reviews.length || product.reviewsCount} reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-bold text-brand-700">Rs. {product.price.toLocaleString()}</span>
            {product.oldPrice && <span className="font-mono text-base text-muted line-through">Rs. {product.oldPrice.toLocaleString()}</span>}
          </div>

          <p className="mt-5 font-body leading-relaxed text-muted">{product.description}</p>

          {/* Quantity + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-line">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="qty-btn" aria-label="Decrease quantity">–</button>
              <span className="w-10 text-center font-mono text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="qty-btn" aria-label="Increase quantity">+</button>
            </div>
            <button disabled={soldOut} onClick={addToCart} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              <i className="fa-solid fa-cart-plus mr-2"></i> Add to Cart
            </button>
            <button disabled={soldOut} className="btn-outline disabled:cursor-not-allowed disabled:opacity-50">Buy Now</button>
          </div>

          {added && (
            <p className="mt-4 font-body text-sm text-brand-700"><i className="fa-solid fa-check mr-1"></i> Added {qty} to cart</p>
          )}

          {/* Trust row */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6 text-center">
            <div><i className="fa-solid fa-truck-fast mb-1 text-lg text-brand-600"></i><p className="font-body text-xs text-muted">Fast delivery</p></div>
            <div><i className="fa-solid fa-shield-heart mb-1 text-lg text-brand-600"></i><p className="font-body text-xs text-muted">Dermatologist tested</p></div>
            <div><i className="fa-solid fa-rotate-left mb-1 text-lg text-brand-600"></i><p className="font-body text-xs text-muted">Easy returns</p></div>
          </div>
        </div>
      </section>

      {/* ===== Reviews ===== */}
      <section className="border-t border-line bg-mist py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-ink">Customer Reviews</h2>
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={avg} />
            <span className="font-body text-sm text-muted">{avg.toFixed(1)} out of 5</span>
          </div>

          {/* Write a review (works locally now; saves to backend later) */}
          <div className="mt-8 rounded-2xl border border-line bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Write a review</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-body text-sm text-muted">Your rating:</span>
              <StarRating value={form.rating} interactive onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="review-input mt-3"
            />
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Share your experience…"
              rows={3}
              className="review-input mt-3"
            />
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 font-body text-sm text-brand-700 hover:text-brand-800">
              <i className="fa-solid fa-image"></i> Add a photo
              {/* TODO: handle the uploaded file with the backend later */}
              <input type="file" accept="image/*" className="hidden" />
            </label>
            <div className="mt-4">
              <button onClick={submitReview} className="btn-primary">Submit review</button>
            </div>
          </div>

          {/* Reviews list */}
          <div className="mt-8 space-y-4">
            {reviews.length === 0 && (
              <p className="font-body text-sm text-muted">No reviews yet — be the first to review this product.</p>
            )}
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-ink">{r.name}</span>
                  <span className="font-body text-xs text-muted">{r.date}</span>
                </div>
                <div className="mt-1"><StarRating value={r.rating} size="text-xs" /></div>
                <p className="mt-2 font-body text-sm text-muted">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Related products ===== */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <h2 className="mb-8 font-display text-2xl font-semibold text-ink">You may also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}