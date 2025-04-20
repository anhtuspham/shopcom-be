import mongoose from "mongoose";
import Variant from "../models/Variant.js";

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variantIndex: {type: Number, default: 0},
        variantProduct: [Variant.schema],
        price: { type: Number, required: true},
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    isCheckoutCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;