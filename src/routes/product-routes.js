import express from 'express';

import {protect} from '../middleware/auth-middleware.js';
import {createProduct, updateProduct, deleteProduct, productDetail} from '../controllers/product-controller.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// router.get('/all', protect, );
router.post('/create', protect, upload.any(), createProduct);
router.put('/update/:id', protect, upload.any(), updateProduct);
router.delete('/delete/:id', protect, deleteProduct);

// productDetail
router.get('/:id', protect, productDetail);

export default router;