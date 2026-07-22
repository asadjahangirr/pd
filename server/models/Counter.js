import mongoose from "mongoose";

/* Simple named counters (e.g. the running order number). */
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number,
});

export default mongoose.model("Counter", counterSchema);
