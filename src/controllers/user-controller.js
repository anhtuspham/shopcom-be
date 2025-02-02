import asyncHandler from "express-async-handler";
import {
  generateOtp,
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

  await generateOtpAndSendEmail(email);

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

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  const userId = user._id;

  if (!userId || !otp) {
    return res.status(400).json({ error: "Có lỗi xảy ra" });
  }

  const otpRecord = await Otp.findOne({ userId, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: "OTP không hợp lệ." });
  }

  await User.findByIdAndUpdate(userId, { isVerifiedEmail: true });

  await Otp.findByIdAndDelete(otpRecord._id);

  res.status(200).json({ message: "Xác thực email thành công" });
};

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

const forgotPassword = asyncHandler(async (req, res) => {
  console.log(process.env.PORT);

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Email không tồn tại." });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const resetLink = `${process.env.FRONT_END_PORT}/auth/reset-password?token=${token}`;
  await sendEmail(
    email,
    `Hi ${user.name}!`,
    `Your verification code is ``<p>Chào bạn,</p>
            <p>Vui lòng nhấn vào liên kết sau để đặt lại mật khẩu:</p>
            <a href="${resetLink}">Đặt lại mật khẩu</a>`
  );

  res.status(200).json({ message: "Email đặt lại mật khẩu đã được gửi." });
});

const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(decoded.id, { verified: true });

    res.redirect(`${process.env.FRONT_END_PORT}/auth/login`);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Token không hợp lệ." });
    return;
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  verifyEmail,
  forgotPassword,
  verifyOtp,
};
