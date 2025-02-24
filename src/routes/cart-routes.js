import express from 'express';

import { protect } from '../middleware/auth-middleware.js';
import { addProductToCart } from '../controllers/cart-controller.js';

const router = express.Router();

router.post('/add-product-cart', protect, addProductToCart);

export default router;