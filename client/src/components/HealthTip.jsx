import { useState } from "react";

/* 30 dermatologist-style tips — one appears at random each time the
   envelope is opened or "Another tip" is pressed. Edit freely. */
const tips = [
  "Apply sunscreen 15 minutes before going outside, even on cloudy days.",
  "Drink at least 8 glasses of water daily to keep your skin hydrated from within.",
  "Never sleep with makeup on — it clogs pores and speeds up aging.",
  "Introduce new skincare products one at a time so you can spot any reaction.",
  "Apply moisturizer on slightly damp skin to lock in hydration more effectively.",
  "Patch-test any new product on your inner arm before using it on your face.",
  "Reapply sunscreen every two hours when you're spending time outdoors.",
  "Wash your face with lukewarm water — hot water strips away natural oils.",
  "Vitamin-C serums work best applied in the morning, under your sunscreen.",
  "Use retinol at night, since sunlight reduces how well it works.",
  "Don't over-exfoliate; two to three times a week is enough for most skin.",
  "Change your pillowcase regularly to reduce acne-causing bacteria.",
  "A diet rich in omega-3 and vegetables supports clearer, healthier skin.",
  "Avoid touching your face during the day to limit transferring bacteria.",
  "Always remove sunscreen thoroughly at night with a gentle cleanser.",
  "Consistency beats expensive products — stick to a simple daily routine.",
  "Keep skincare away from direct sunlight to preserve its potency.",
  "Moisturize your neck and hands too; they show signs of aging early.",
  "Ask a dermatologist before combining strong actives like retinol and acids.",
  "Aim for 7–8 hours of sleep — your skin repairs itself overnight.",
  "Manage stress; high stress levels can trigger breakouts and dullness.",
  "Keep a separate clean towel for your face to avoid spreading bacteria.",
  "SPF-30 blocks about 97% of UVB rays; higher SPF helps sensitive skin.",
  "Never pop pimples — it can cause scarring and spread infection.",
  "Layer skincare from the thinnest texture to the thickest for best absorption.",
  "Store active serums somewhere cool to help them last longer.",
  "Clean your makeup brushes weekly to prevent bacterial buildup.",
  "Hydrated skin ages slower — never skip moisturizer, even with oily skin.",
  "Check expiry dates; expired skincare can irritate your skin.",
  "Choose fragrance-free products if your skin is sensitive or reactive.",
];

export default function HealthTip() {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(tips[0]);

  const pickRandom = () => {
    let next = tip;
    while (next === tip && tips.length > 1) {
      next = tips[Math.floor(Math.random() * tips.length)];
    }
    setTip(next);
  };

  const handleOpen = () => {
    if (!open) {
      pickRandom();
      setOpen(true);
    }
  };

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-600">From Our Pharmacists</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          A little note for your skin
        </h2>
        <p className="mx-auto mt-4 max-w-md font-body text-sm text-muted">
          Double-click the envelope to reveal a dermatologist-approved skincare tip.
        </p>

        <div className="mt-14 flex flex-col items-center">
          <div className="envelope-scene">
            <div
              className={`envelope ${open ? "open" : ""}`}
              onDoubleClick={handleOpen}
              role="button"
              tabIndex={0}
              aria-label="Open the health-tip envelope"
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
            >
              <div className="env-back"></div>
              <div className="env-letter">
                <i className="fa-solid fa-quote-left mb-3 text-brand-300"></i>
                <p className="font-body text-sm leading-relaxed text-ink">{tip}</p>
              </div>
              <div className="env-front"></div>
              <div className="env-flap"></div>
              <div className="env-seal"><i className="fa-solid fa-leaf text-sm"></i></div>
            </div>
          </div>

          {/* Controls appear once the envelope is open */}
          <div
            className={`mt-12 flex gap-3 transition-opacity duration-500 ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <button onClick={pickRandom} className="btn-primary">
              <i className="fa-solid fa-shuffle mr-2"></i> Another tip
            </button>
            <button onClick={() => setOpen(false)} className="btn-outline">
              Seal envelope
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
