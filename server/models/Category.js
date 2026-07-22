import mongoose from "mongoose";

/* Product categories, managed by the admin.
   Products reference a category by its name (string). "All" is not stored —
   it's a UI-only option the storefront adds in front of these. */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    visible: { type: Boolean, default: true }, // hidden categories don't show on the storefront
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export default mongoose.model("Category", categorySchema);
