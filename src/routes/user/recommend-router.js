import express from "express";

import { protect } from "../../middleware/auth-middleware.js";
import { getRecommendation } from "../../controllers/recommend-controller.js";

const router = express.Router();

router.get("/fetch-product", protect, getRecommendation);

export default router;
