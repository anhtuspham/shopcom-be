import express from 'express';
import { authUser, registerUser, getUserProfile, forgotPassword, verifyOtpEmail, verifyOtpPassword, resendOtpVerifyEmail} from '../controllers/user-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

router.post('/register', registerUser);
router.post('/verifyOtp', verifyOtpEmail);
router.post('/resendOtpVerifyEmail', resendOtpVerifyEmail);

router.post('/forgotPassword', forgotPassword);
router.post('/verifyOtpPassword', verifyOtpPassword);

export default router;