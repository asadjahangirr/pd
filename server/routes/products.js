import express from "express";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// turn a name into a url-safe slug: "Glow Serum!" -> "glow-serum"
function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// make sure the slug is unique, appending -2, -3, ... if needed
async function uniqueSlug(base) {
  const root = base || "product";
  let slug = root;
  let n = 2;
  while (await Product.exists({ slug })) slug = `${root}-${n++}`;
  return slug;
}

// normalize incoming product fields from the admin form
function cleanFields(b) {
  const out = {};
  if ("name" in b) out.name = String(b.name).trim();
  if ("category" in b) out.category = String(b.category).trim();
  if ("price" in b) out.price = Number(b.price);
  if ("costPrice" in b) out.costPrice = Math.max(0, Number(b.costPrice) || 0);
  if ("oldPrice" in b) out.oldPrice = b.oldPrice === "" || b.oldPrice == null ? null : Number(b.oldPrice);
  if ("badge" in b) out.badge = b.badge || null;
  if ("image" in b) out.image = String(b.image || "");
  if ("image2" in b) out.image2 = String(b.image2 || "");
  if ("stock" in b) out.stock = Math.max(0, Number(b.stock) || 0);
  if ("short" in b) out.short = String(b.short || "");
  if ("description" in b) out.description = String(b.description || "");
  if ("rating" in b) out.rating = Number(b.rating) || 0;
  if ("reviewsCount" in b) out.reviewsCount = Number(b.reviewsCount) || 0;
  if ("featured" in b) out.featured = !!b.featured;
  return out;
}

/* ===== Public reads ===== */

// GET /api/products — all products, in display order
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ order: 1 });
  res.json(products);
});

// GET /api/products/:id — one product by slug
router.get("/:id", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.id });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

/* ===== Admin writes (require a valid token) ===== */

// POST /api/products — create a product
router.post("/", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.category || b.price == null || b.price === "") {
    return res.status(400).json({ error: "Name, category and price are required" });
  }
  const fields = cleanFields(b);
  const slug = await uniqueSlug(slugify(b.slug || b.name));
  const last = await Product.findOne().sort({ order: -1 }).select("order");

  const product = await Product.create({
    ...fields,
    slug,
    order: last ? last.order + 1 : 0,
    reviews: [],
  });
  res.status(201).json(product);
});

// POST /api/products/bulk-delete — delete many at once
router.post("/bulk-delete", requireAuth, async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No products selected" });
  const r = await Product.deleteMany({ slug: { $in: ids } });
  res.json({ ok: true, deleted: r.deletedCount });
});

// POST /api/products/bulk-stock — set the same stock on many at once
router.post("/bulk-stock", requireAuth, async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No products selected" });
  const stock = Math.max(0, Number(req.body?.stock) || 0);
  const r = await Product.updateMany({ slug: { $in: ids } }, { stock });
  res.json({ ok: true, updated: r.modifiedCount });
});

// PUT /api/products/reorder — set display order from an array of slugs
// (must be defined before "/:id" so it isn't treated as a product id)
router.put("/reorder", requireAuth, async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids array is required" });
  await Promise.all(ids.map((slug, i) => Product.updateOne({ slug }, { order: i })));
  const products = await Product.find().sort({ order: 1 });
  res.json(products);
});

// PUT /api/products/:id — update a product
router.put("/:id", requireAuth, async (req, res) => {
  const fields = cleanFields(req.body || {});
  const product = await Product.findOneAndUpdate({ slug: req.params.id }, fields, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// DELETE /api/products/:id — remove a product
router.delete("/:id", requireAuth, async (req, res) => {
  const deleted = await Product.findOneAndDelete({ slug: req.params.id });
  if (!deleted) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true, id: req.params.id });
});

export default router;
