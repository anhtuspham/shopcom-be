import express from "express";

import { protect } from "../../middleware/auth-middleware.js";
import {
  addProductToCart,
  removeProductFromCart,
  getUserCart,
} from "../../controllers/cart-controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Quản lý giỏ hàng
 */
router.post("/add-product-cart", protect, addProductToCart);
router.post("/remove-product-cart", protect, removeProductFromCart);
router.get("/get", protect, getUserCart);

export default router;
