import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* GET /api/categories
   Public. Returns all categories in order (storefront filters visible ones). */
router.get("/", async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 });
  res.json(categories);
});

/* POST /api/categories  (admin) — create a category */
router.post("/", requireAuth, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Category name is required" });

  const exists = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (exists) return res.status(409).json({ error: "That category already exists" });

  const last = await Category.findOne().sort({ order: -1 }).select("order");
  const category = await Category.create({
    name,
    visible: req.body?.visible !== false,
    order: last ? last.order + 1 : 0,
  });
  res.status(201).json(category);
});

/* PUT /api/categories/:id  (admin) — rename / show-hide / reorder.
   Renaming also updates every product that used the old name. */
router.put("/:id", requireAuth, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });

  const b = req.body || {};

  if (b.name != null) {
    const newName = String(b.name).trim();
    if (!newName) return res.status(400).json({ error: "Category name cannot be empty" });

    const clash = await Category.findOne({
      _id: { $ne: category._id },
      name: new RegExp(`^${newName}$`, "i"),
    });
    if (clash) return res.status(409).json({ error: "Another category already has that name" });

    if (newName !== category.name) {
      // keep products in sync with the renamed category
      await Product.updateMany({ category: category.name }, { category: newName });
      category.name = newName;
    }
  }

  if (b.visible != null) category.visible = !!b.visible;
  if (b.order != null) category.order = Number(b.order);

  await category.save();
  res.json(category);
});

/* DELETE /api/categories/:id  (admin)
   Blocked if products still use it, so products never get orphaned. */
router.delete("/:id", requireAuth, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });

  const inUse = await Product.countDocuments({ category: category.name });
  if (inUse > 0) {
    return res.status(409).json({
      error: `${inUse} product${inUse > 1 ? "s" : ""} still use "${category.name}". Move or delete them first.`,
      count: inUse,
    });
  }

  await category.deleteOne();
  res.json({ ok: true, id: req.params.id });
});

export default router;
