import mongoose from "mongoose";

/* ------------------------------------------------------------------
   Product model — mirrors the exact shape the frontend expects:
   { id (slug), name, category, price, oldPrice|null, badge, image,
     short, description, rating, reviewsCount, reviews[] }

   Internally we store the slug in a "slug" field (Mongo already uses
   "_id" for its own id). The toJSON transform below re-exposes it as
   "id" and hides Mongo's internal fields, so the API output matches
   client/src/data/products.js one-to-one.
   ------------------------------------------------------------------ */

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    text: { type: String, required: true },
    date: { type: String, default: "" },
  },
  { _id: false } // reviews are embedded; they don't need their own ids
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // used as `id` in URLs
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 }, // what the admin paid — used for profit
    oldPrice: { type: Number, default: null },
    badge: { type: String, default: null }, // "discount" | "out" | null
    image: { type: String, default: "" }, // main/cover image (shown by default)
    image2: { type: String, default: "" }, // hover image (shown on hover / auto-slideshow)
    stock: { type: Number, default: 0, min: 0 }, // pieces in stock (admin-managed)
    short: { type: String, default: "" },
    description: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
    featured: { type: Boolean, default: false }, // pinned to homepage Best Sellers
    order: { type: Number, default: 0 }, // display order (admin-controlled)
  },
  { timestamps: true }
);

// Shape the JSON the API returns so it matches the frontend exactly.
productSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret.slug;
    delete ret._id;
    delete ret.__v;
    delete ret.slug;
    delete ret.order;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export default mongoose.model("Product", productSchema);
