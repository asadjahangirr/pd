import express from "express";
import Message from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* POST /api/messages — public. Saves a contact-form submission. */
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name and message are required" });
  }
  await Message.create({
    name: name.trim(),
    email: (email || "").trim(),
    subject: (subject || "").trim(),
    message: message.trim(),
  });
  res.status(201).json({ ok: true });
});

// Admin only below.
router.use(requireAuth);

router.get("/", async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

router.put("/:id", async (req, res) => {
  const update = {};
  if ("read" in (req.body || {})) update.read = !!req.body.read;
  const message = await Message.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" });
  if (!message) return res.status(404).json({ error: "Message not found" });
  res.json(message);
});

router.delete("/:id", async (req, res) => {
  const deleted = await Message.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Message not found" });
  res.json({ ok: true, id: req.params.id });
});

export default router;
