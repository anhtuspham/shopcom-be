import express from "express";

import { protect } from "../../middleware/auth-middleware.js";
import {
  addFavorite,
  removeFavorite,
  getFavorites
} from "../../controllers/product-controller.js";

const router = express.Router();

// favoriteProduct
router.post("/add-favorite", protect, addFavorite);
router.delete("/remove-favorite", protect, removeFavorite);
router.get("/get-favorite-products", protect, getFavorites);

export default router;
