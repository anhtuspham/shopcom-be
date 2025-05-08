import mongoose from "mongoose";
import Variant from '../models/Variant.js';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: { type: String },
      productDescription: { type: String },
      productCategory: { type: String },
      productBrand: { type: String },
      variantIndex: { type: Number, default: 0 },
      variantProduct: [Variant.schema],
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  discountAmount: {type: Number, default: 0},
  finalAmount: {type: Number},
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "delivered", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Banking"],
    default: "COD",
  },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
