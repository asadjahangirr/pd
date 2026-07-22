import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import uploadRouter from "./routes/upload.js";
import contentRouter from "./routes/content.js";
import themeRouter from "./routes/theme.js";
import ordersRouter from "./routes/orders.js";
import couponsRouter from "./routes/coupons.js";
import messagesRouter from "./routes/messages.js";
import expensesRouter from "./routes/expenses.js";
import adminRouter from "./routes/admin.js";

const app = express();

// --- Middleware ---
app.use(cors());            // lets the React app (different port) call this API
app.use(express.json());    // parse JSON request bodies

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/content", contentRouter);
app.use("/api/theme", themeRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/admin", adminRouter);

// 404 for anything else under /api
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler (Express 5 forwards rejected async promises here)
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Server error" });
});

// --- Start: connect to MongoDB first, then listen ---
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("✓ Connected to MongoDB");
    app.listen(PORT, () => console.log(`✓ API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  });
