import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductImage from "../components/ProductImage.jsx";
import StarRating from "../components/StarRating.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { productStatus } from "../lib/product.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products, getProductById, loading, error, reload } = useProducts();
  const product = getProductById(id);

  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: 0, text: "" });

  // When navigating between products, scroll up and reset local state.
  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setForm({ name: "", rating: 0, text: "" });
  }, [id]);

  // Load this product's reviews once it's available from the API.
  useEffect(() => {
    setReviews(product?.reviews || []);
  }, [product]);

  // While the product list is still loading from the API
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-brand-400"></i>
          <p className="mt-4 font-body text-sm text-muted">Loading product…</p>
        </div>
        <Footer />
      </div>
    );
  }

  // The API call failed
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <i className="fa-solid fa-triangle-exclamation mb-4 text-4xl text-danger"></i>
          <h1 className="font-display text-2xl text-ink">Couldn't load this product</h1>
          <p className="mt-2 font-body text-sm text-muted">{error}</p>
          <button onClick={reload} className="btn-primary mt-6 inline-flex">
            <i className="fa-solid fa-rotate-right mr-2"></i> Try again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Loaded, but no product matches this URL
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

  const { soldOut, off } = productStatus(product);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;

  const addToCart = () => addItem(product, qty);
  const buyNow = () => {
    addItem(product, qty);
    navigate("/checkout");
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
        <div className="relative flex items-center justify-center rounded-[2rem] border border-line bg-brand-50 p-10">
          {soldOut ? (
            <span className="absolute left-5 top-5 rounded-full bg-danger px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-white">Out of Stock</span>
          ) : off > 0 ? (
            <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 font-mono text-xs font-bold text-white">-{off}%</span>
          ) : null}
          {/* Default: packaged shot (name-1.png); hover / touch-slideshow reveals the current image */}
          <ProductImage
            image={product.image}
            image2={product.image2}
            alt={product.name}
            className="h-72 w-full animate-[slow-float_4s_ease-in-out_infinite] sm:h-105"
          />
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
            {product.oldPrice > product.price && <span className="font-mono text-base text-muted line-through">Rs. {product.oldPrice.toLocaleString()}</span>}
          </div>

          <p className="mt-5 font-body leading-relaxed text-muted">{product.description}</p>

          {/* Quantity + actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center self-start rounded-full border border-line sm:self-auto">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="qty-btn" aria-label="Decrease quantity">–</button>
              <span className="w-10 text-center font-mono text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="qty-btn" aria-label="Increase quantity">+</button>
            </div>
            <button disabled={soldOut} onClick={addToCart} className="btn-primary w-full justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
              <i className="fa-solid fa-cart-plus mr-2"></i> Add to Cart
            </button>
            <button disabled={soldOut} onClick={buyNow} className="btn-outline w-full justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Buy Now</button>
          </div>

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
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}