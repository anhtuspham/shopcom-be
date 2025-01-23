import express from 'express';
import { authUser, registerUser, getUserProfile, forgotPassword, verifyEmail} from '../controllers/user-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/register', registerUser);
router.post('/forgotPassword', forgotPassword);
router.get('/verify-email', verifyEmail);

export default router;