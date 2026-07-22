import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Order from "../models/Order.js";
import Counter from "../models/Counter.js";

/* Clears all orders and resets the order-number counter.
   Run this once before you go live so test orders are wiped and the
   first real order is #10000:  npm run reset:orders */
async function run() {
  try {
    await connectDB();
    const o = await Order.deleteMany({});
    const c = await Counter.deleteMany({});
    console.log(`✓ Cleared ${o.deletedCount} order(s) and reset the counter (${c.deletedCount}).`);
    console.log("  Your next order will be #10000.");
  } catch (err) {
    console.error("✗ Reset failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
run();
