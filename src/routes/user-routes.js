import express from 'express';
import { authUser, registerUser, getUserProfile} from '../controllers/user-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/register', registerUser);

export default router;