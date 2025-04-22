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
  getOrderById
} from "../../controllers/order-controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Order
 *     description: Quản lý đơn hàng
 */
router.post("/", protect, createOrder);
router.post("/:orderId/pay", protect, confirmPayment);
router.post("/create-payment-intent", protect, createPaymentIntent);
router.delete("/:orderId/cancel", protect, cancelOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/get-order/:orderId", protect, getOrderById);

export default router;
