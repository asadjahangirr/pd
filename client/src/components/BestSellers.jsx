import { useState, useEffect } from "react";

/* ONE card that rotates through these products automatically.
   Use transparent-background PNGs so the product floats on the panel. */
const products = [
  {
    // ADD IMAGE (transparent PNG): client/public/images/glam.png
    img: "/images/glam.png",
    name: "Glamora Vitamin-C Serum",
    desc: "A brightening vitamin-C serum that evens tone, fades dark spots, and restores a healthy glow with daily use.",
    price: 1750,
    oldPrice: 2100,     // set to null if there is no discount
    badge: "discount",  // "discount" | "out" | null
  },
  {
    // ADD IMAGE (transparent PNG): client/public/images/rayset.png
    img: "/images/rayset.png",
    name: "Ray Set Sunblock SPF-60",
    desc: "Lightweight broad-spectrum SPF-60 protection that shields against UVA/UVB rays without a greasy finish.",
    price: 750,
    oldPrice: null,
    badge: null,
  },
  {
    // ADD IMAGE (transparent PNG): client/public/images/acneca.png
    img: "/images/acneca.png",
    name: "Acneca Anti-Acne Serum",
    desc: "A targeted anti-acne treatment that calms breakouts, reduces redness, and helps prevent future blemishes.",
    price: 1550,
    oldPrice: null,
    badge: "out",
  },
];

function Badge({ type, price, oldPrice }) {
  if (type === "out") {
    return (
      <span className="absolute right-4 top-4 z-10 rounded-full bg-danger px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-white shadow">
        Out of Stock
      </span>
    );
  }
  if (type === "discount" && oldPrice) {
    const off = Math.round((1 - price / oldPrice) * 100);
    return (
      <span className="absolute right-4 top-4 z-10 rounded-full bg-accent px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-white shadow">
        -{off}%
      </span>
    );
  }
  return null;
}

export default function BestSellers() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % products.length), 4200);
    return () => clearInterval(t);
  }, [paused]);

  const p = products[active];
  const soldOut = p.badge === "out";

  const next = () => setActive((i) => (i + 1) % products.length);
  const prev = () => setActive((i) => (i - 1 + products.length) % products.length);

  return (
    <section className="bg-white py-20 md:py-28">
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
            <Badge type={p.badge} price={p.price} oldPrice={p.oldPrice} />
            {products.map((prod, i) => (
              <img
                key={i}
                src={prod.img}
                alt={prod.name}
                className={`max-h-72 w-auto object-contain transition-all duration-700 ease-out ${
                  // speed of the images moving
                  i === active
                   ? "opacity-100 animate-[slow-float_3.5s_ease-in-out_infinite]"
                    : "pointer-events-none absolute opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Details panel — re-keyed by `active` so text re-animates on change */}
          <div key={active} className="flex flex-col justify-center gap-4 p-8 md:p-12">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-500 opacity-0 animate-[fade-up_0.5s_ease_forwards]">
              Best Seller {active + 1} / {products.length}
            </span>
            <h3 className="font-display text-2xl font-semibold text-ink opacity-0 animate-[fade-up_0.6s_ease_0.05s_forwards] md:text-3xl">
              {p.name}
            </h3>
            <p className="max-w-md font-body text-sm leading-relaxed text-muted opacity-0 animate-[fade-up_0.6s_ease_0.15s_forwards]">
              {p.desc}
            </p>
            <div className="flex items-baseline gap-3 opacity-0 animate-[fade-up_0.6s_ease_0.25s_forwards]">
              <span className="font-mono text-2xl font-bold text-brand-700">Rs. {p.price.toLocaleString()}</span>
              {p.oldPrice && (
                <span className="font-mono text-sm text-muted line-through">Rs. {p.oldPrice.toLocaleString()}</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 opacity-0 animate-[fade-up_0.6s_ease_0.35s_forwards]">
              <button disabled={soldOut} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                Buy Now
              </button>
              <button disabled={soldOut} className="btn-outline disabled:cursor-not-allowed disabled:opacity-50">
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
