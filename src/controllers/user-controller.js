import asyncHandler from "express-async-handler";
import {
  generateOtpAndSendEmail,
  generateToken,
} from "../utils/generateData.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

import Otp from "../models/Otp.js";
import User from "../models/User.js";

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ error: "User already exists" });
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  console.log(`user ${user}`);

  await generateOtpAndSendEmail({
    email: email,
    isVerifiedEmail: true,
    isForgotPassword: false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ error: "Invalid user data" });
    throw new Error("Invalid user data");
  }
});

const verifyOtpEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    console.error("Người dùng không tồn tại");
    return res.status(404).json({ message: "Email không tồn tại." });
  }
  const userId = user._id;

  if (!userId || !otp) {
    return res.status(400).json({ error: "Có lỗi xảy ra" });
  }

  const otpRecord = await Otp.findOne({ userId, otp });
  if (!otpRecord) {
    return res.status(400).json({ message: "OTP không hợp lệ." });
  }

  await User.findByIdAndUpdate(userId, { isVerifiedEmail: true });
  await Otp.findByIdAndDelete(otpRecord._id);
  res.status(200).json({ message: "Xác thực email thành công" });
};

const resendOtpVerifyEmail = asyncHandler(async (req, res) => {
  const { email, otpType } = req.body;
  const isVerifiedEmail = otpType === 'verifiedEmail';
  const isForgotPassword = otpType === 'forgotPassword';
  await generateOtpAndSendEmail({ email: email, isForgotPassword: isForgotPassword, isVerifiedEmail: isVerifiedEmail });

  res.status(200).json({ message: "Mã xác minh đã được gửi." });
});

const verifyOtpPassword = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    console.error("Người dùng không tồn tại");
    return res.status(404).json({ message: "Email không tồn tại." });
  }
  const userId = user._id;

  if (!userId || !otp) {
    return res
      .status(400)
      .json({ error: "Thiếu dữ liệu cần thiết để xác thực OTP" });
  }

  const otpRecord = await Otp.findOne({ userId, otp });

  if (!otpRecord) {
    return res
      .status(400)
      .json({ message: "OTP không hợp lệ hoặc đã hết hạn." });
  }

  await User.findByIdAndUpdate(userId, { isForgotPassword: false });
  await Otp.findByIdAndDelete(otpRecord._id);
  res
    .status(200)
    .json({ message: "OTP đã xác thực. Hãy đặt lại mật khẩu của bạn" });
};

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  await User.findOneAndUpdate({ email }, { isForgotPassword: true });

  if (!user) return res.status(404).json({ message: "Email không tồn tại." });

  await generateOtpAndSendEmail({ email: email, isForgotPassword: true });
  res.status(200).json({ message: "Mã xác minh đã được gửi." });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404).json({ error: "User not found" });
    throw new Error("User not found");
  }
});

// const updatePassword = asyncHandler(async (req, res) => {
//   const {}
// });

export {
  authUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  verifyOtpEmail,
  verifyOtpPassword,
  resendOtpVerifyEmail,
};
