import express from 'express';
import { authUser, registerUser, getUserProfile, forgotPassword, verifyOtpEmail, verifyOtpPassword, resendOtpVerifyEmail} from '../controllers/user-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/login', authUser);

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtpEmail);
router.post('/resend-otp-verify-email', resendOtpVerifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp-password', verifyOtpPassword);

router.get('/profile', protect, getUserProfile);

export default router;