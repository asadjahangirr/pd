import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const TOKEN_TTL = "8h"; // how long a login stays valid

/* POST /api/admin/login
   Verifies username + password against the env credentials, returns a JWT. */
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, JWT_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
    return res.status(500).json({ error: "Admin auth is not configured on the server" });
  }

  // Always run the hash compare so we don't leak which field was wrong.
  const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  const usernameOk = username === ADMIN_USERNAME;

  if (!usernameOk || !passwordOk) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign({ role: "admin", username: ADMIN_USERNAME }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
  res.json({ token, username: ADMIN_USERNAME });
});

/* GET /api/admin/me
   Protected — proves a token is valid and returns who you are. */
router.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.admin.username, role: req.admin.role });
});

export default router;
