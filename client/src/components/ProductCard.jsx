import { Link } from "react-router-dom";
import StarRating from "./StarRating.jsx";

/* One product tile for the grid. `onAddToCart` is optional so this card
   can also be reused in the "related products" list without a handler. */
export default function ProductCard({ product, onAddToCart }) {
  const soldOut = product.badge === "out";
  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_50px_rgba(23,36,31,0.10)]">
      {/* Badge (top-left) */}
      {product.badge === "discount" && off > 0 && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-white">-{off}%</span>
      )}
      {soldOut && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-danger px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-white">Out of Stock</span>
      )}

      {/* Image — links to the detail page, zooms on hover */}
      <Link to={`/products/${product.id}`} className="relative flex h-56 items-center justify-center overflow-hidden bg-brand-50 p-6">
        {/* ADD IMAGE (transparent PNG) -> client/public/images/... */}
        <img src={product.image} alt={product.name} className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-500">{product.category}</span>
        <Link to={`/products/${product.id}`} className="mt-1 font-display text-lg font-semibold leading-snug text-ink transition-colors hover:text-brand-700">
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-2">
          <StarRating value={product.rating} size="text-xs" />
          <span className="font-body text-xs text-muted">({product.reviewsCount})</span>
        </div>

        <p className="mt-2 line-clamp-2 font-body text-sm text-muted">{product.short}</p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-mono text-lg font-bold text-brand-700">Rs. {product.price.toLocaleString()}</span>
          {product.oldPrice && <span className="font-mono text-xs text-muted line-through">Rs. {product.oldPrice.toLocaleString()}</span>}
        </div>

        <button
          disabled={soldOut}
          onClick={() => onAddToCart && onAddToCart(product)}
          className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i className="fa-solid fa-cart-plus mr-2"></i>{soldOut ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}