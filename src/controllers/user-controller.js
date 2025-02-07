import asyncHandler from "express-async-handler";
import {
  generateOtpAndSendEmail,
  generateResetPasswordToken,
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

  if(!user) {
    res.status(404).json({ message: "Người dùng không tồn tại" });
    throw new Error("Người dùng không tồn tại");
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ messsage: "Email hoặc mật khẩu không hợp lệ" });
    throw new Error("Email hoặc mật khẩu không hợp lệ");
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

const resendOtp = asyncHandler(async (req, res) => {
  const { email, otpType } = req.body;
  const isVerifiedEmail = otpType === "verifiedEmail";
  const isForgotPassword = otpType === "forgotPassword";

  if (!isVerifiedEmail && !isForgotPassword) {
    return res.status(400).json({ message: "Loại OTP không hợp lệ" });
  }

  await generateOtpAndSendEmail({
    email: email,
    isForgotPassword: isForgotPassword,
    isVerifiedEmail: isVerifiedEmail,
  });

  res.status(200).json({ message: "Mã xác minh đã được gửi." });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  await User.findOneAndUpdate({ email }, { isForgotPassword: true });

  if (!user) return res.status(404).json({ message: "Email không tồn tại." });

  await generateOtpAndSendEmail({ email: email, isForgotPassword: true });
  res.status(200).json({ message: "Mã xác minh đã được gửi." });
});

const verifyOtpPassword = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    console.error("Người dùng không tồn tại");
    return res.status(404).json({ message: "Người dùng không tồn tại." });
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
    .json({
      message: "OTP đã xác thực. Hãy đặt lại mật khẩu của bạn",
      email: email,
      token: generateResetPasswordToken(userId),
    });
};

const resetPassword = asyncHandler(async (req, res) => {
  const {token, newPassword, confirmNewPassword} = req.body;

  if(newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "Mật khẩu và xác nhận mật khẩu không giống nhau." });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if(decoded.purpose !== "resetPassword") {
    return res.status(400).json({ message: "Token không hợp lệ" });
  }

  const user = await User.findById(decoded.id);
  if(!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  };
  user.password = newPassword;
  user.markModified('password');
  await user.save();

  res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công" });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { email, oldPassword, password, confirmPassword } = req.body;

  if(!email || !oldPassword || !password || !confirmPassword) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  const user = await User.findOne({ email: email });
  if(!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  if (!password || !confirmPassword || password !== confirmPassword) {
    return res.status(400).json({ message: "Mật khẩu và xác nhận mật khẩu không giống nhau." });
  }

  if(await user.matchPassword(oldPassword)) {
    user.password = password;
    user.markModified('password');
    await user.save();
    
    return res.status(200).json({ message: "Mật khẩu cập nhật thành công", user: user});
  } else {
    return res.status(400).json({ message: "Mật khẩu không chính xác" });
  }
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

export {
  authUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  verifyOtpEmail,
  verifyOtpPassword,
  resendOtp,
  updatePassword,
  resetPassword
};
