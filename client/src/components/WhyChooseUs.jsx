import { useEffect, useRef } from "react";

const features = [
  {
    icon: "fa-solid fa-user-doctor",
    title: "Dermatologist Approved",
    text: "Every formula is developed with expert skincare science for safe, effective daily use.",
  },
  {
    icon: "fa-solid fa-leaf",
    title: "Gentle, Clean Ingredients",
    text: "Free from harsh chemicals and suitable for all skin types, including sensitive skin.",
  },
  {
    icon: "fa-solid fa-flask-vial",
    title: "Visible, Tested Results",
    text: "Clinically tested to improve skin texture and clarity with consistent use.",
  },
];

export default function WhyChooseUs() {
  const ref = useRef(null);

  // Reveal cards as they scroll into view (same idea as your old lazy-load)
  useEffect(() => {
    const els = ref.current.querySelectorAll(".card-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-mist py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-14 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Our Promise</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Why choose Delight Pharma
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="card-reveal group rounded-2xl border border-line bg-white p-8 text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-2xl text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                <i className={f.icon}></i>
              </div>
              <h3 className="font-display text-xl font-semibold text-ink">{f.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
