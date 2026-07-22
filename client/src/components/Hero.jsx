import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext.jsx";

export default function Hero() {
  const { images, text } = useSiteContent();
  const [active, setActive] = useState(0);

  // Slides = admin-editable text (Admin → Site text) + admin-managed images
  const slides = [
    { eyebrow: text.hero1_eyebrow, title: text.hero1_title, text: text.hero1_text, img: images.hero1 },
    { eyebrow: text.hero2_eyebrow, title: text.hero2_title, text: text.hero2_text, img: images.hero2 },
    { eyebrow: text.hero3_eyebrow, title: text.hero3_title, text: text.hero3_text, img: images.hero3 },
  ];
  const count = slides.length;

  // Auto-advance the slideshow
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count]);

  const slide = slides[active];
  const next = () => setActive((i) => (i + 1) % count);
  const prev = () => setActive((i) => (i - 1 + count) % count);

  return (
    <section className="relative overflow-hidden bg-mist">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 md:grid-cols-2 md:gap-12 md:py-24 lg:px-8">
        {/* Left: copy — re-keyed by `active` so it re-animates on every slide */}
        <div key={active} className="max-w-xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brand-600 opacity-0 animate-[fade-up_0.6s_ease_forwards]">
            {slide.eyebrow}
          </p>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.12] tracking-tight text-ink opacity-0 animate-[fade-up_0.7s_ease_0.1s_forwards] sm:text-4xl md:text-5xl lg:text-6xl">
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
