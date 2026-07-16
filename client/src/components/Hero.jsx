import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/* Three hero slides. Each image gets its own headline + description.
   Text is written for you; just drop the matching images in public/images/. */
const slides = [
  {
    // ADD IMAGE: client/public/images/hero-1.png  (acne / clear-skin scene)
    img: "/images/hero-1.png",
    eyebrow: "Acne & Blemish Care",
    title: "Clearer skin, backed by science",
    text: "Target breakouts and blemishes with dermatologist-formulated serums designed for visible, gentle results.",
  },
  {
    // ADD IMAGE: client/public/images/hero-2.png  (sun-protection scene)
    img: "/images/hero-2.png",
    eyebrow: "Daily Sun Protection",
    title: "The protection your skin deserves",
    text: "Broad-spectrum SPF-60 defense against sun damage, pigmentation, and premature aging — for everyday confidence.",
  },
  {
    // ADD IMAGE: client/public/images/hero-3.png  (brightening / anti-aging glow scene)
    img: "/images/hero-3.png",
    eyebrow: "Brightening & Anti-Aging",
    title: "Timeless glow, every day",
    text: "Advanced brightening and anti-aging solutions that restore radiance and smooth, healthy-looking skin.",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  // Auto-advance the slideshow
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  const slide = slides[active];
  const next = () => setActive((i) => (i + 1) % slides.length);
  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden bg-mist">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24 lg:px-8">
        {/* Left: copy — re-keyed by `active` so it re-animates on every slide */}
        <div key={active} className="max-w-xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brand-600 opacity-0 animate-[fade-up_0.6s_ease_forwards]">
            {slide.eyebrow}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink opacity-0 animate-[fade-up_0.7s_ease_0.1s_forwards] md:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted opacity-0 animate-[fade-up_0.7s_ease_0.25s_forwards]">
            {slide.text}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4 opacity-0 animate-[fade-up_0.7s_ease_0.4s_forwards]">
            <Link to="/products" className="btn-primary">Shop All Products</Link>
            <Link to="/about" className="btn-ghost">
              Learn about us <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Right: crossfading image slideshow */}
        <div className="relative">
          <div className="relative aspect-square w-full overflow-hidden rounded-4xl bg-white shadow-[0_20px_60px_rgba(23,36,31,0.10)] ring-1 ring-line">
            {slides.map((s, i) => (
              <img
                key={i}
                src={s.img}
                alt={s.title}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1200 ease-out ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 rounded-4xl ring-1 ring-inset ring-black/5"></div>
            {/* slide arrow */}
            <button onClick={prev} aria-label="Previous slide" className="carousel-arrow absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={next} aria-label="Next slide" className="carousel-arrow absolute right-3 top-1/2 z-10 -translate-y-1/2">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          {/* Slide indicators */}
          <div className="mt-5 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-8 bg-brand-600" : "w-2.5 bg-brand-200 hover:bg-brand-300"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
