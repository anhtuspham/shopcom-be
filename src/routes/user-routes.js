import express from 'express';
import { authUser, registerUser, getUserProfile, forgotPassword, verifyOtpEmail, verifyOtpPassword, resendOtp, resetPassword, updatePassword} from '../controllers/user-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/login', authUser);

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtpEmail);
router.post('/resend-otp', resendOtp);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp-password', verifyOtpPassword);
router.post('/reset-password', resetPassword);
router.post('/update-password', updatePassword);

router.get('/profile', protect, getUserProfile);

export default router;