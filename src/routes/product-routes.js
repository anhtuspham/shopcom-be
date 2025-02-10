import express from 'express';

import {protect} from '../middleware/auth-middleware.js';
import { createProduct } from '../controllers/product-controller.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// router.get('/all', protect, );
router.post('/create', protect, upload.single('images'), createProduct);

export default router;