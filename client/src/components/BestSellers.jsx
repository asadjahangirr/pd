import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import ProductImage from "./ProductImage.jsx";
import { productStatus } from "../lib/product.js";
/* ONE card that rotates through the best-selling products automatically.
   Best sellers = the most-reviewed products, pulled from the API. */

function Badge({ product }) {
  const { soldOut, off } = productStatus(product);
  if (soldOut) {
    return (
      <span className="absolute right-4 top-4 z-10 rounded-full bg-danger px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-white shadow">
        Out of Stock
      </span>
    );
  }
  if (off > 0) {
    return (
      <span className="absolute right-4 top-4 z-10 rounded-full bg-accent px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-white shadow">
        -{off}%
      </span>
    );
  }
  return null;
}

export default function BestSellers() {
  const { products: allProducts, loading } = useProducts();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Best sellers = products the admin pinned as "featured" (in their order).
  // If none are featured yet, fall back to the 3 most-reviewed.
  const products = useMemo(() => {
    const featured = allProducts.filter((p) => p.featured);
    if (featured.length) return featured.slice(0, 8);
    return [...allProducts].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 3);
  }, [allProducts]);

  useEffect(() => {
    if (paused || products.length === 0) return;
    const t = setInterval(() => setActive((i) => (i + 1) % products.length), 4200);
    return () => clearInterval(t);
  }, [paused, products.length]);

  // Keep the active index valid if the list changes
  useEffect(() => {
    if (active >= products.length) setActive(0);
  }, [active, products.length]);

  // Loading / empty state — keep the section header, swap the card for a note
  if (loading || products.length === 0) {
    return (
      <section className="bg-white py-14 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Best Sellers</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Loved by our customers
          </h2>
          <div className="mt-10">
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-2xl text-brand-400"></i>
                <p className="mt-3 font-body text-sm text-muted">Loading best sellers…</p>
              </>
            ) : (
              <p className="font-body text-sm text-muted">No products to show yet.</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const p = products[active];
  const { soldOut } = productStatus(p);

  const next = () => setActive((i) => (i + 1) % products.length);
  const prev = () => setActive((i) => (i - 1 + products.length) % products.length);

  return (
    <section className="bg-white py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Best Sellers</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Loved by our customers
          </h2>
        </div>

        {/* The single rotating card (pauses on hover) */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative mx-auto grid max-w-5xl overflow-hidden rounded-4xl border border-line bg-mist shadow-[0_24px_70px_rgba(23,36,31,0.10)] md:grid-cols-2"
        >
          <button onClick={prev} aria-label="Previous product" className="carousel-arrow absolute left-3 top-1/2 z-20 -translate-y-1/2">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button onClick={next} aria-label="Next product" className="carousel-arrow absolute right-3 top-1/2 z-20 -translate-y-1/2">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          {/* Image panel */}
          <div className="relative flex min-h-80 items-center justify-center bg-brand-50 p-10 md:p-14">
            <Badge product={p} />
            {products.map((prod, i) => (
              <ProductImage
                key={prod.id}
                image={prod.image}
                image2={prod.image2}
                alt={prod.name}
                // speed of the images moving (lower = faster, more visible motion)
                className={`h-64 w-full transition-opacity duration-700 ease-out sm:h-72 ${
                  i === active
                   ? "opacity-100 animate-[slow-float_2.4s_ease-in-out_infinite]"
                    : "pointer-events-none absolute inset-0 opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Details panel — re-keyed by `active` so text re-animates on change */}
          <div key={active} className="flex flex-col justify-center gap-4 p-6 sm:p-8 md:p-12">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-500 opacity-0 animate-[fade-up_0.5s_ease_forwards]">
              Best Seller {active + 1} / {products.length}
            </span>
            <h3 className="font-display text-2xl font-semibold text-ink opacity-0 animate-[fade-up_0.6s_ease_0.05s_forwards] md:text-3xl">
              {p.name}
            </h3>
            <p className="max-w-md font-body text-sm leading-relaxed text-muted opacity-0 animate-[fade-up_0.6s_ease_0.15s_forwards]">
              {p.description}
            </p>
            <div className="flex items-baseline gap-3 opacity-0 animate-[fade-up_0.6s_ease_0.25s_forwards]">
              <span className="font-mono text-2xl font-bold text-brand-700">Rs. {p.price.toLocaleString()}</span>
              {p.oldPrice > p.price && (
                <span className="font-mono text-sm text-muted line-through">Rs. {p.oldPrice.toLocaleString()}</span>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-3 opacity-0 animate-[fade-up_0.6s_ease_0.35s_forwards] sm:flex-row sm:flex-wrap">
              <button
                disabled={soldOut}
                onClick={() => {
                  addItem({ id: p.id, name: p.name, price: p.price, image: p.image });
                  navigate("/checkout");
                }}
                className="btn-primary w-full justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Buy Now
              </button>
              <button
                disabled={soldOut}
                onClick={() => addItem({ id: p.id, name: p.name, price: p.price, image: p.image })}
                className="btn-outline w-full justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <i className="fa-solid fa-cart-plus mr-2"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Manual dots */}
        <div className="mt-8 flex justify-center gap-2">
          {products.map((_, i) => (
            <button
              key={i}
              aria-label={`Show product ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-8 bg-brand-600" : "w-2.5 bg-brand-200 hover:bg-brand-300"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
