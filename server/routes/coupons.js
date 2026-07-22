import express from "express";
import Coupon from "../models/Coupon.js";
import { requireAuth } from "../middleware/auth.js";
import { couponError, couponDiscount } from "../lib/coupon.js";

const router = express.Router();

/* POST /api/coupons/validate — public. Checks a code against a subtotal. */
router.post("/validate", async (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  const subtotal = Number(req.body?.subtotal) || 0;
  if (!code) return res.status(400).json({ error: "Enter a coupon code" });

  const coupon = await Coupon.findOne({ code });
  const err = couponError(coupon, subtotal);
  if (err) return res.status(400).json({ error: err });

  res.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    discount: couponDiscount(coupon, subtotal),
  });
});

// Everything below requires admin auth.
router.use(requireAuth);

router.get("/", async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

router.post("/", async (req, res) => {
  const b = req.body || {};
  const code = String(b.code || "").trim().toUpperCase();
  if (!code) return res.status(400).json({ error: "Code is required" });
  if (b.value == null || b.value === "" || Number(b.value) <= 0) {
    return res.status(400).json({ error: "Value must be greater than 0" });
  }
  if (await Coupon.findOne({ code })) return res.status(409).json({ error: "That code already exists" });

  const coupon = await Coupon.create({
    code,
    type: b.type === "fixed" ? "fixed" : "percent",
    value: Number(b.value),
    minSubtotal: Math.max(0, Number(b.minSubtotal) || 0),
    active: b.active !== false,
    expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
  });
  res.status(201).json(coupon);
});

router.put("/:id", async (req, res) => {
  const b = req.body || {};
  const update = {};
  if ("code" in b) update.code = String(b.code).trim().toUpperCase();
  if ("type" in b) update.type = b.type === "fixed" ? "fixed" : "percent";
  if ("value" in b) update.value = Number(b.value);
  if ("minSubtotal" in b) update.minSubtotal = Math.max(0, Number(b.minSubtotal) || 0);
  if ("active" in b) update.active = !!b.active;
  if ("expiresAt" in b) update.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" });
  if (!coupon) return res.status(404).json({ error: "Coupon not found" });
  res.json(coupon);
});

router.delete("/:id", async (req, res) => {
  const deleted = await Coupon.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Coupon not found" });
  res.json({ ok: true, id: req.params.id });
});

export default router;
