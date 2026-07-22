import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Cloudinary auto-reads CLOUDINARY_URL from the environment.
cloudinary.config({ secure: true });

// Keep the file in memory, cap at 5 MB, images only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/* POST /api/upload  (admin)
   Accepts a single "image" file, uploads to Cloudinary, returns { url }. */
router.post("/", requireAuth, (req, res) => {
  if (!process.env.CLOUDINARY_URL) {
    return res.status(500).json({ error: "Image hosting is not configured (CLOUDINARY_URL missing)" });
  }

  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    try {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "delight-pharma",
      });
      res.json({ url: result.secure_url });
    } catch (e) {
      console.error("Cloudinary upload error:", e.message);
      res.status(500).json({ error: "Upload failed. Please try again." });
    }
  });
});

export default router;
