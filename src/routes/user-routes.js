import express from 'express';
import { authUser, registerUser, getUserProfile, forgotPassword, verifyEmail, verifyOtp, resendOtpVerifyEmail} from '../controllers/user-controller.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/register', registerUser);
router.post('/forgotPassword', forgotPassword);
router.get('/verifyEmail', verifyEmail);
router.post('/verifyOtp', verifyOtp);
router.post('/resendOtpVerifyEmail', resendOtpVerifyEmail);

export default router;