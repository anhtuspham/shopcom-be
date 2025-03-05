import express from 'express';

import { protect, admin } from '../middleware/auth-middleware.js';
import { createOrder, confirmPayment, getAllOrders, updateOrderStatus, getUserOrders, cancelOrder } from "../controllers/order-controller.js"

const router = express.Router();

router.post("/", protect, createOrder);
router.post("/:orderId/pay", protect, confirmPayment);
router.get("/", protect, admin, getAllOrders);
router.put("/:orderId/status", protect, admin, updateOrderStatus);
router.get("/my-orders", protect, getUserOrders);
router.delete("/:orderId/cancel", protect, cancelOrder);

export default router;