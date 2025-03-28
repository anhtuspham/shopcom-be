import express from "express";
import {
  login,
  registerUser,
  getProfileUser,
  forgotPassword,
  verifyOtpEmail,
  verifyOtpPassword,
  resendOtp,
  resetPassword,
  updatePassword,
  updateUserProfile
} from "../../controllers/user-controller.js";
import { protect } from "../../middleware/auth-middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Quản lý người dùng
 */
router.post("/login", login);

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtpEmail);
router.post("/resend-otp", resendOtp);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp-password", verifyOtpPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", protect, updatePassword);

router.get("/profile", protect, getProfileUser);

// update
router.put("/profile", protect, updateUserProfile);

export default router;
