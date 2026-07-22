import express from "express";
import Theme from "../models/Theme.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const isHex = (s) => s === "" || /^#[0-9a-fA-F]{6}$/.test(s);

/* GET /api/theme — public. The active primary/accent colours. */
router.get("/", async (req, res) => {
  const t = await Theme.findOne({ key: "theme" });
  res.json({ primary: t?.primary || "", accent: t?.accent || "" });
});

/* PUT /api/theme — admin. Set the colours (empty = reset to default). */
router.put("/", requireAuth, async (req, res) => {
  const primary = String(req.body?.primary || "");
  const accent = String(req.body?.accent || "");
  if (!isHex(primary) || !isHex(accent)) {
    return res.status(400).json({ error: "Colours must be hex like #226f51" });
  }
  const t = await Theme.findOneAndUpdate(
    { key: "theme" },
    { primary, accent },
    { upsert: true, returnDocument: "after" }
  );
  res.json({ primary: t.primary, accent: t.accent });
});

export default router;
