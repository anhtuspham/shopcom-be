import express from "express";

import { protect } from "../../middleware/auth-middleware.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  productDetail,
  reviewProduct,
  getProductReview,
  deleteReview,
  addFavorite,
  removeFavorite,
  getFavorites
} from "../../controllers/product-controller.js";
import upload from "../../middleware/multer.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Quản lý sản phẩm
 */
router.post("/create", protect, upload.any(), createProduct);
router.put("/update/:id", protect, upload.any(), updateProduct);
router.delete("/delete/:id", protect, deleteProduct);

// productDetail
router.get("/:id", protect, productDetail);

// reviewProduct
router.post("/create-review/:productId", protect, reviewProduct);
router.post("/get-review/:productId", protect, getProductReview);
router.delete("/delete-review/:reviewId", protect, deleteReview);

export default router;
