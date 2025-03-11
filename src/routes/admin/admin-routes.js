import express from "express";
import { protect, admin } from "../../middleware/auth-middleware.js";
import { updateOrderStatus, getAllOrders } from "../../controllers/order-controller.js"
import { getAllUsers, deleteUser, updateUserRole } from "../../controllers/user-controller.js";

const router = express.Router();

// user
router.get("/user/get-all-user", protect, admin, getAllUsers);
router.delete("/user/:id", protect, admin, deleteUser);
router.put("/user/:id/role", protect, admin, updateUserRole); 

// order
router.put("/order/:orderId/status", protect, admin, updateOrderStatus);
router.get("/order/get-all-order", protect, admin, getAllOrders);

export default router;