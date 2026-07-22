import { createContext, useContext, useEffect, useState } from "react";
import { fetchContent } from "../api/admin.js";
import { useAutoRefresh } from "../lib/useAutoRefresh.js";

/* Site-wide editable content: images (logo, hero, about) + text copy.
   Anything the admin hasn't set falls back to these defaults, so the
   store always shows sensible content. */

const DEFAULT_IMAGES = {
  logo: "/images/logo.png",
  hero1: "/images/hero-1.png",
  hero2: "/images/hero-2.png",
  hero3: "/images/hero-3.png",
  about: "/images/about.jpg",
};

const DEFAULT_TEXT = {
  brandName: "Delight Pharma",
  phone: "+92 346 5263486",
  email: "delightpharma.store@gmail.com",
  address: "Rawalpindi, Pakistan",

  hero1_eyebrow: "Acne & Blemish Care",
  hero1_title: "Clearer skin, backed by science",
  hero1_text: "Target breakouts and blemishes with dermatologist-formulated serums designed for visible, gentle results.",
  hero2_eyebrow: "Daily Sun Protection",
  hero2_title: "The protection your skin deserves",
  hero2_text: "Broad-spectrum SPF-60 defense against sun damage, pigmentation, and premature aging — for everyday confidence.",
  hero3_eyebrow: "Brightening & Anti-Aging",
  hero3_title: "Timeless glow, every day",
  hero3_text: "Advanced brightening and anti-aging solutions that restore radiance and smooth, healthy-looking skin.",

  about_title: "Skincare that respects your skin",
  about_subtitle: "Delight Pharma was built on a simple belief: effective skincare should be gentle, honest, and backed by science — never a gamble.",
  about_who_heading: "A pharmacy that cares about skin, not shortcuts",
  about_who_p1: "We started with a small, focused range of dermatologist-recommended products — each one chosen to solve a real, everyday skin concern. No overwhelming shelves, no empty promises.",
  about_who_p2: "From vitamin-C brightening to broad-spectrum sun protection and targeted acne care, everything we offer is tested, trusted, and made to fit into a simple daily routine.",
};

const SiteContentContext = createContext();
export const useSiteContent = () => useContext(SiteContentContext);

function mergeImages(images) {
  const out = { ...DEFAULT_IMAGES };
  if (images) for (const k of Object.keys(DEFAULT_IMAGES)) if (images[k]) out[k] = images[k];
  return out;
}
function mergeText(text) {
  const out = { ...DEFAULT_TEXT };
  if (text) for (const k of Object.keys(DEFAULT_TEXT)) if (text[k]) out[k] = text[k];
  return out;
}

export function SiteContentProvider({ children }) {
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [text, setText] = useState(DEFAULT_TEXT);

  const load = () =>
    fetchContent()
      .then((c) => {
        setImages(mergeImages(c.images));
        setText(mergeText(c.text));
      })
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  useAutoRefresh(load, 30000);

  return (
    <SiteContentContext.Provider value={{ images, text, defaultText: DEFAULT_TEXT, reload: load }}>
      {children}
    </SiteContentContext.Provider>
  );
}
