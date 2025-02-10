import express from 'express';

import { protect } from '../middleware/auth-middleware';

const router = express.Router();

router.get('/all', protect, );

export default router;