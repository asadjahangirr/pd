import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Counter from "../models/Counter.js";
import Coupon from "../models/Coupon.js";
import { couponError, couponDiscount } from "../lib/coupon.js";
import { sendOrderEmails } from "../lib/email.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const FREE_SHIPPING = 2500;
const SHIPPING_COST = 200;
const FIRST_ORDER_NUMBER = 10000;
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

// Sequential order numbers starting at 10000.
async function nextOrderNumber() {
  const existing = await Counter.findById("orderNumber");
  if (!existing) {
    await Counter.create({ _id: "orderNumber", seq: FIRST_ORDER_NUMBER });
    return FIRST_ORDER_NUMBER;
  }
  const updated = await Counter.findByIdAndUpdate(
    "orderNumber",
    { $inc: { seq: 1 } },
    { returnDocument: "after" }
  );
  return updated.seq;
}

/* POST /api/orders — public. Places a Cash-on-Delivery order.
   Prices/totals are recomputed from the DB (never trust the client). */
router.post("/", async (req, res) => {
  const { customer, items } = req.body || {};

  if (!customer?.name?.trim() || !customer?.phone?.trim() || !customer?.address?.trim()) {
    return res.status(400).json({ error: "Name, phone and address are required" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  const resolved = [];
  for (const it of items) {
    const p = await Product.findOne({ slug: it.id });
    if (!p) return res.status(400).json({ error: `Product not found: ${it.id}` });
    if ((p.stock ?? 0) <= 0) return res.status(400).json({ error: `"${p.name}" is out of stock` });
    const qty = Math.max(1, Number(it.qty) || 1);
    resolved.push({ productId: p.slug, name: p.name, price: p.price, cost: p.costPrice || 0, qty, image: p.image });
  }

  const subtotal = resolved.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;

  // Apply a coupon if a valid code was sent.
  let discount = 0;
  let appliedCoupon = "";
  const codeIn = String(req.body?.couponCode || "").trim().toUpperCase();
  if (codeIn) {
    const coupon = await Coupon.findOne({ code: codeIn });
    if (coupon && !couponError(coupon, subtotal)) {
      discount = couponDiscount(coupon, subtotal);
      appliedCoupon = coupon.code;
    }
  }

  const total = subtotal - discount + shipping;

  const orderNumber = await nextOrderNumber();
  const order = await Order.create({
    orderNumber,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: (customer.email || "").trim(),
      address: customer.address.trim(),
      city: (customer.city || "").trim(),
      notes: (customer.notes || "").trim(),
    },
    items: resolved,
    subtotal,
    discount,
    coupon: appliedCoupon,
    shipping,
    total,
    paymentMethod: "COD",
    status: "pending",
  });

  // Email the customer a confirmation + notify the owner (non-blocking).
  sendOrderEmails(order);

  res.status(201).json(order);
});

/* POST /api/orders/track — public. Look up an order by number + phone.
   Returns a sanitized view (no address/email) so a customer can check status. */
router.post("/track", async (req, res) => {
  const orderNumber = Number(req.body?.orderNumber);
  const phone = String(req.body?.phone || "");
  if (!orderNumber || !phone.trim()) {
    return res.status(400).json({ error: "Order number and phone are required" });
  }

  const order = await Order.findOne({ orderNumber });
  const norm = (s) => String(s || "").replace(/\D/g, "");
  const a = norm(order?.customer?.phone);
  const b = norm(phone);
  const match = order && (a === b || (a.length >= 9 && b.length >= 9 && a.slice(-9) === b.slice(-9)));

  if (!match) return res.status(404).json({ error: "No order found with that number and phone" });

  res.json({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    customerName: order.customer.name,
    items: order.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
  });
});

/* GET /api/orders — admin. Newest first. */
router.get("/", requireAuth, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

/* PUT /api/orders/:id/status — admin. Confirm / cancel / complete.
   Completing decreases stock; un-completing restores it. */
router.put("/:id/status", requireAuth, async (req, res) => {
  const status = req.body?.status;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const prev = order.status;
  if (status !== prev) {
    if (status === "completed" && prev !== "completed") {
      // completing -> subtract stock (never below 0)
      for (const it of order.items) {
        const p = await Product.findOne({ slug: it.productId });
        if (p) {
          p.stock = Math.max(0, (p.stock || 0) - it.qty);
          await p.save();
        }
      }
    } else if (prev === "completed" && status !== "completed") {
      // un-completing -> restore stock
      for (const it of order.items) {
        const p = await Product.findOne({ slug: it.productId });
        if (p) {
          p.stock = (p.stock || 0) + it.qty;
          await p.save();
        }
      }
    }
    order.status = status;
    await order.save();
  }

  res.json(order);
});

/* DELETE /api/orders/:id — admin. Remove an order (e.g. spam/test).
   Restores stock first if it was completed. */
router.delete("/:id", requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.status === "completed") {
    for (const it of order.items) {
      await Product.updateOne({ slug: it.productId }, { $inc: { stock: it.qty } });
    }
  }
  await order.deleteOne();
  res.json({ ok: true, id: req.params.id });
});

export default router;
