import express from "express";
import { protect, admin } from "../../middleware/auth-middleware.js";
import { updateOrderStatus, getAllOrders } from "../../controllers/order-controller.js"
import { getAllUsers, deleteUser, updateUserRole } from "../../controllers/user-controller.js";
import { createCoupon, deleteCoupon, getAllCoupons, updateCoupon } from "../../controllers/coupon-controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Quyền admin
 */
// user
router.get("/user/get-all-user", protect, admin, getAllUsers);
router.delete("/user/:id", protect, admin, deleteUser);
router.put("/user/:id/role", protect, admin, updateUserRole); 

// order
router.put("/order/:orderId/status", protect, admin, updateOrderStatus);
router.get("/order/get-all-order", protect, admin, getAllOrders);

// coupon
router.get("/coupon", protect, admin, getAllCoupons);
router.post("/coupon", protect, admin, createCoupon);
router.put("/coupon/:id", protect, admin, updateCoupon);
router.delete("/coupon/:id", protect, admin, deleteCoupon);

export default router;