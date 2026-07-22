import express from "express";
import Content from "../models/Content.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const SLOTS = ["logo", "hero1", "hero2", "hero3", "about"];
const TEXT_KEYS = [
  "brandName", "phone", "email", "address",
  "hero1_eyebrow", "hero1_title", "hero1_text",
  "hero2_eyebrow", "hero2_title", "hero2_text",
  "hero3_eyebrow", "hero3_title", "hero3_text",
  "about_title", "about_subtitle", "about_who_heading", "about_who_p1", "about_who_p2",
];

/* GET /api/content — public. Editable site images + text. */
router.get("/", async (req, res) => {
  const content = await Content.findOne({ key: "site" });
  res.json({ images: content?.images || {}, text: content?.text || {} });
});

/* PUT /api/content — admin. Updates image slots and/or text keys. */
router.put("/", requireAuth, async (req, res) => {
  const images = req.body?.images || {};
  const text = req.body?.text || {};
  const set = {};
  for (const k of SLOTS) if (k in images) set[`images.${k}`] = String(images[k] || "");
  for (const k of TEXT_KEYS) if (k in text) set[`text.${k}`] = String(text[k] ?? "");

  const content = await Content.findOneAndUpdate(
    { key: "site" },
    { $set: set },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  res.json({ images: content.images, text: content.text });
});

export default router;
