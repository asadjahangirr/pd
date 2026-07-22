import mongoose from "mongoose";

/* A single theme record: the primary + accent colours (hex).
   Empty strings mean "use the built-in default palette". Tiny — a few bytes. */
const themeSchema = new mongoose.Schema(
  {
    key: { type: String, default: "theme", unique: true },
    primary: { type: String, default: "" },
    accent: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Theme", themeSchema);
