import express from 'express';

import {protect} from '../middleware/auth-middleware.js';
import {createProduct, updateProduct} from '../controllers/product-controller.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// router.get('/all', protect, );
router.post('/create', protect, upload.array('images'), createProduct);
router.put('/update/:id', protect, upload.array('images'), updateProduct);

export default router;