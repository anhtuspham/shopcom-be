import express from "express";

import { protect, admin } from "../../middleware/auth-middleware.js";
import {
  createOrder,
  confirmPayment,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
  cancelOrder,
  createPaymentIntent,
} from "../../controllers/order-controller.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.post("/:orderId/pay", protect, confirmPayment);
router.post("/create-payment-intent", protect, createPaymentIntent);
router.delete("/:orderId/cancel", protect, cancelOrder);
router.get("/my-orders", protect, getUserOrders);

export default router;
