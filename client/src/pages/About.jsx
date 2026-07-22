import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useSiteContent } from "../context/SiteContentContext.jsx";

const stats = [
  { value: "5,000+", label: "Happy customers" },
  { value: "9", label: "Curated products" },
  { value: "4.6★", label: "Average rating" },
  { value: "100%", label: "Dermatologist tested" },
];

const values = [
  { icon: "fa-solid fa-user-doctor", title: "Science first", text: "Every formula is grounded in dermatological research, not trends or hype." },
  { icon: "fa-solid fa-leaf", title: "Gentle & clean", text: "No harsh chemicals — skin-friendly ingredients suitable for daily use." },
  { icon: "fa-solid fa-heart", title: "Made for real skin", text: "Products built for everyday concerns: acne, pigmentation, sun, and aging." },
  { icon: "fa-solid fa-award", title: "Honest quality", text: "Transparent about what goes in, and proud of the results it delivers." },
];

export default function About() {
  const { images, text } = useSiteContent();
  const revealRef = useRef(null);

  useEffect(() => {
    const els = revealRef.current.querySelectorAll(".card-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-visible"), obs.unobserve(e.target))),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white" ref={revealRef}>
      <Navbar />

      {/* ===== Hero ===== */}
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-14 text-center lg:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Our Story</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
            {text.about_title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-muted">
            {text.about_subtitle}
          </p>
        </div>
      </section>

      {/* ===== Story + image ===== */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="card-reveal no-lift">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Who we are</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{text.about_who_heading}</h2>
            <p className="mt-5 font-body text-sm leading-relaxed text-muted">{text.about_who_p1}</p>
            <p className="mt-4 font-body text-sm leading-relaxed text-muted">{text.about_who_p2}</p>
            <Link to="/products" className="btn-primary mt-8 inline-flex">Explore our products</Link>
          </div>

          <div className="card-reveal no-lift">
            {/* ADD IMAGE: a brand/lab/product lifestyle photo -> client/public/images/about.jpg */}
            <div className="aspect-4/3 w-full overflow-hidden rounded-[2.2rem] border border-line bg-brand-50">
              <img src={images.about} alt="Delight Pharma" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats band ===== */}
      <section className="bg-brand-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-14 md:grid-cols-4 lg:px-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-4xl font-semibold text-white">{s.value}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-brand-200">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Values ===== */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="mb-14 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">What we stand for</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">Our promise to you</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <div key={i} className="card-reveal group rounded-2xl border border-line bg-white p-7 text-center" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                <i className={v.icon}></i>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="card-reveal rounded-[2rem] bg-brand-900 px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">Ready to care for your skin?</h2>
          <p className="mx-auto mt-4 max-w-md font-body text-sm text-brand-200">
            Browse our dermatologist-formulated range and find what your skin has been waiting for.
          </p>
          <Link to="/products" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-body text-sm font-semibold text-brand-800 transition-transform duration-300 hover:-translate-y-1">
            Shop all products <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}