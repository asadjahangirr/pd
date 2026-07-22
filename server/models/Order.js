import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: String, // product slug
    name: String,
    price: Number,
    cost: Number, // cost price at order time (for profit)
    qty: Number,
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true }, // WhatsApp number
      email: { type: String, default: "" },
      address: { type: String, required: true },
      city: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    coupon: { type: String, default: "" },
    shipping: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "COD" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Order", orderSchema);
