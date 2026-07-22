import mongoose from "mongoose";

/* Site-wide editable content — a single document (key: "site").
   Holds the swappable images used across the storefront. Empty values
   mean "use the built-in default" (handled on the frontend). */
const contentSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    images: {
      logo: { type: String, default: "" },
      hero1: { type: String, default: "" },
      hero2: { type: String, default: "" },
      hero3: { type: String, default: "" },
      about: { type: String, default: "" },
    },
    // editable site copy (flexible key -> string map)
    text: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
