import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { submitMessage } from "../api/messages.js";
import { useSiteContent } from "../context/SiteContentContext.jsx";

export default function Contact() {
  const { text } = useSiteContent();
  const info = [
    { icon: "fa-solid fa-envelope", label: "Email", value: text.email },
    { icon: "fa-solid fa-phone", label: "Phone", value: text.phone },
    { icon: "fa-solid fa-location-dot", label: "Address", value: text.address },
  ];
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const revealRef = useRef(null);

  // Reveal the info cards on scroll
  useEffect(() => {
    const els = revealRef.current.querySelectorAll(".card-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-visible"), obs.unobserve(e.target))),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const submit = async () => {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }
    setSending(true);
    try {
      await submitMessage(form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ===== Header ===== */}
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">Get in touch</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm leading-relaxed text-muted">
            Questions about a product, an order, or your skin? Send us a message and our team will get back to you.
          </p>
        </div>
      </section>

      {/* ===== Form + info ===== */}
      <section ref={revealRef} className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Form (spans 3) */}
          <div className="lg:col-span-3">
            <div className="rounded-[2rem] border border-line bg-white p-8 shadow-[0_18px_50px_rgba(23,36,31,0.06)] md:p-10">
              <h2 className="font-display text-2xl font-semibold text-ink">Send us a message</h2>
              <p className="mt-2 font-body text-sm text-muted">We usually reply within one business day.</p>

              {sent && (
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 font-body text-sm text-brand-800 animate-[fade-up_0.4s_ease]">
                  <i className="fa-solid fa-circle-check text-brand-600"></i>
                  Thanks! Your message has been sent — we'll be in touch soon.
                </div>
              )}
              {error && (
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-danger/10 px-4 py-3 font-body text-sm text-danger">
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="review-input" />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email address" className="review-input" />
              </div>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="review-input mt-4" />
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="How can we help?" className="review-input mt-4" />

              <button onClick={submit} disabled={sending} className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-60">
                {sending ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Sending…</> : <><i className="fa-solid fa-paper-plane mr-2"></i> Send message</>}
              </button>
            </div>
          </div>

          {/* Info (spans 2) */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {info.map((item, i) => (
                <div
                  key={i}
                  className="card-reveal flex items-start gap-4 rounded-2xl border border-line bg-white p-5"
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <i className={item.icon}></i>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-brand-500">{item.label}</p>
                    <p className="mt-1 font-body text-sm text-ink">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}