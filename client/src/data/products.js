// ============================================================
//  SINGLE SOURCE OF TRUTH for all products.
//  Products page, ProductDetail page (and later Cart/Checkout)
//  all read from here. When the backend is ready, this array is
//  replaced by an API fetch — everything else keeps working.
//
//  NOTE ON IMAGES: two of your files have spaces in the name
//  ("acne bae.png", "del bar.png"). Save those WITHOUT spaces as
//  "acne-bae.png" and "del-bar.png" in client/public/images/.
// ============================================================

export const categories = [
  "All",
  "Serums",
  "Acne Care",
  "Anti-Aging",
  "Sun Protection",
  "Scar Care",
  "Medicated Soaps",
];

export const products = [
  {
    id: "glamora-vitamin-c-serum",
    name: "Glamora Vitamin-C Serum",
    category: "Serums",
    price: 1750,
    oldPrice: 2100,        // set to null if there is no discount
    badge: "discount",     // "discount" | "out" | null
    image: "/images/glam.png",
    short: "Brightening vitamin-C serum for an even, radiant tone.",
    description:
      "A lightweight vitamin-C serum that brightens dull skin, fades dark spots, and evens out tone with daily use. Absorbs quickly without leaving a sticky finish.",
    rating: 4.7,
    reviewsCount: 34,
    reviews: [
      { name: "Ayesha K.", rating: 5, text: "My dark spots have visibly faded in three weeks. Light and non-greasy.", date: "2 weeks ago" },
      { name: "Hamza R.", rating: 4, text: "Good serum, absorbs fast. Wish the bottle was bigger.", date: "1 month ago" },
    ],
  },
  {
    id: "glowmax-anti-aging-serum",
    name: "GlowMax Anti-Aging Serum",
    category: "Anti-Aging",
    price: 1990,
    oldPrice: null,
    badge: null,
    image: "/images/glowaxa.png",
    short: "Restores firmness and smooths fine lines.",
    description:
      "An advanced anti-aging serum that improves elasticity, softens fine lines, and restores a youthful glow. Suitable for daily nighttime use.",
    rating: 4.8,
    reviewsCount: 21,
    reviews: [],
  },
  {
    id: "acneca-anti-acne-serum",
    name: "Acneca Anti-Acne Serum",
    category: "Acne Care",
    price: 1550,
    oldPrice: null,
    badge: null,
    image: "/images/acneca.png",
    short: "Calms breakouts and reduces redness.",
    description:
      "A targeted anti-acne treatment that calms active breakouts, reduces redness, and helps prevent future blemishes without over-drying the skin.",
    rating: 4.5,
    reviewsCount: 40,
    reviews: [
      { name: "Sana M.", rating: 5, text: "Cleared my hormonal acne better than anything else I've tried.", date: "3 weeks ago" },
    ],
  },
  {
    id: "scar-gel-silicon",
    name: "Scar Gel Silicon",
    category: "Scar Care",
    price: 1850,
    oldPrice: 2200,
    badge: "discount",
    image: "/images/scarset.png",
    short: "Silicone gel that softens and flattens scars.",
    description:
      "A medical-grade silicone gel that helps soften, flatten, and fade old and new scars over time. Gentle enough for daily application.",
    rating: 4.6,
    reviewsCount: 12,
    reviews: [],
  },
  {
    id: "ray-set-sunblock-spf-60",
    name: "Ray Set Sunblock SPF-60",
    category: "Sun Protection",
    price: 750,
    oldPrice: null,
    badge: null,
    image: "/images/rayset.png",
    short: "Broad-spectrum SPF-60, matte finish.",
    description:
      "Lightweight broad-spectrum SPF-60 protection that shields against UVA and UVB rays with a non-greasy, matte finish. Perfect for daily wear.",
    rating: 4.7,
    reviewsCount: 55,
    reviews: [],
  },
  {
    id: "delight-moisturizing-bar",
    name: "Delight Moisturizing Bar",
    category: "Medicated Soaps",
    price: 860,
    oldPrice: null,
    badge: null,
    image: "/images/lotion.png",
    short: "Gentle cleansing bar that hydrates as it cleans.",
    description:
      "A gentle moisturizing cleansing bar that removes impurities while preserving the skin's natural moisture barrier. Suitable for face and body.",
    rating: 4.4,
    reviewsCount: 18,
    reviews: [],
  },
  {
    id: "it-scab-90g",
    name: "It-Scab 90g",
    category: "Medicated Soaps",
    price: 280,
    oldPrice: null,
    badge: "out",
    image: "/images/scab.png",
    short: "Medicated cleansing bar for problem skin.",
    description:
      "A medicated cleansing bar formulated to support clearer, healthier skin with regular use. Best for oily and blemish-prone skin types.",
    rating: 4.3,
    reviewsCount: 9,
    reviews: [],
  },
  {
    id: "acneca-bar-90g",
    name: "Acneca Bar 90g",
    category: "Acne Care",
    price: 280,
    oldPrice: null,
    badge: null,
    image: "/images/acne-bae.png",
    short: "Daily anti-acne cleansing bar.",
    description:
      "An anti-acne cleansing bar that gently clears excess oil and helps reduce breakouts when used as part of a daily routine.",
    rating: 4.4,
    reviewsCount: 15,
    reviews: [],
  },
  {
    id: "delight-bar-90g",
    name: "Delight Bar 90g",
    category: "Medicated Soaps",
    price: 280,
    oldPrice: null,
    badge: null,
    image: "/images/del-bar.png",
    short: "Everyday gentle cleansing bar.",
    description:
      "A mild everyday cleansing bar that keeps skin fresh and clean without irritation. A gentle choice for all skin types.",
    rating: 4.5,
    reviewsCount: 11,
    reviews: [],
  },
];

// Used by the product detail page to look a product up from the URL.
export const getProductById = (id) => products.find((p) => p.id === id);