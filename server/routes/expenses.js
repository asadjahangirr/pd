import express from "express";
import Expense from "../models/Expense.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All expense routes are admin-only.
router.use(requireAuth);

// GET /api/expenses — newest first
router.get("/", async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
  res.json(expenses);
});

// POST /api/expenses
router.post("/", async (req, res) => {
  const { title, amount, date, note } = req.body || {};
  if (!title?.trim() || amount == null || amount === "") {
    return res.status(400).json({ error: "Title and amount are required" });
  }
  const expense = await Expense.create({
    title: String(title).trim(),
    amount: Math.max(0, Number(amount) || 0),
    date: date ? new Date(date) : new Date(),
    note: String(note || "").trim(),
  });
  res.status(201).json(expense);
});

// PUT /api/expenses/:id
router.put("/:id", async (req, res) => {
  const b = req.body || {};
  const update = {};
  if ("title" in b) update.title = String(b.title).trim();
  if ("amount" in b) update.amount = Math.max(0, Number(b.amount) || 0);
  if ("date" in b) update.date = b.date ? new Date(b.date) : new Date();
  if ("note" in b) update.note = String(b.note || "").trim();

  const expense = await Expense.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" });
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  res.json(expense);
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  const deleted = await Expense.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Expense not found" });
  res.json({ ok: true, id: req.params.id });
});

export default router;
