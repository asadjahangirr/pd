import { Link } from "react-router-dom";
import StarRating from "./StarRating.jsx";
import ProductImage from "./ProductImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { productStatus } from "../lib/product.js";

/* One product tile for the grid. Compact on phones (2 per row), full on larger. */
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { soldOut, off } = productStatus(product);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 animate-[fade-in_0.5s_ease] hover:-translate-y-1.5 hover:shadow-[0_18px_50px_rgba(23,36,31,0.10)] active:scale-[0.98]">
      {/* Badge — out-of-stock takes priority over a discount */}
      {soldOut ? (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-danger px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-white sm:left-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-[11px]">Out of Stock</span>
      ) : off > 0 ? (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-white sm:left-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-[11px]">-{off}%</span>
      ) : null}

      {/* Image — links to the detail page, reveal on hover / slideshow on touch */}
      <Link to={`/products/${product.id}`} className="relative flex h-40 items-center justify-center overflow-hidden bg-brand-50 p-4 sm:h-56 sm:p-6">
        <ProductImage image={product.image} image2={product.image2} alt={product.name} className="h-full w-full" />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-brand-500 sm:text-[11px]">{product.category}</span>
        <Link to={`/products/${product.id}`} className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-ink transition-colors hover:text-brand-700 sm:text-lg">
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5">
          <StarRating value={product.rating} size="text-[10px] sm:text-xs" />
          <span className="font-body text-[11px] text-muted sm:text-xs">({product.reviewsCount})</span>
        </div>

        {/* Longer blurb only on larger screens */}
        <p className="mt-2 hidden line-clamp-2 font-body text-sm text-muted sm:block">{product.short}</p>

        {/* Price + button pushed to the bottom so every card aligns */}
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-mono text-base font-bold text-brand-700 sm:text-lg">Rs. {product.price.toLocaleString()}</span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="font-mono text-[11px] text-muted line-through sm:text-xs">Rs. {product.oldPrice.toLocaleString()}</span>
          )}
        </div>

        <button
          disabled={soldOut}
          onClick={() => addItem(product)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-600 px-3 py-2.5 font-body text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-sm"
        >
          <i className="fa-solid fa-cart-plus"></i> {soldOut ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
