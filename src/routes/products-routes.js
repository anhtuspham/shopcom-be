import express from "express";

import { protect } from "../middleware/auth-middleware.js";
import { getProducts } from "../controllers/products-controller.js";

const router = express.Router();

router.get("/", protect, getProducts);

export default router;