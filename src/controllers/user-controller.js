import asyncHandler from "express-async-handler";
import {
  generateOtpAndSendEmail,
  generateResetPasswordToken,
  generateToken,
} from "../utils/generateData.js";
import jwt from "jsonwebtoken";

import Otp from "../models/Otp.js";
import User from "../models/User.js";

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
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

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, isAdmin, address } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400).json({ message: "Tên, email và mật khẩu là bắt buộc" });
    throw new Error("Tên, email và mật khẩu là bắt buộc");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "Người dùng đã tồn tại" });
    throw new Error("Người dùng đã tồn tại");
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    isAdmin: isAdmin || false, // Default to false if isAdmin is not provided
    address: address || ""
  });

  if (user) {
    // Generate OTP for email verification
    await generateOtpAndSendEmail({
      email: email,
      isVerifiedEmail: true,
      isForgotPassword: false,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      message: "Người dùng được tạo thành công. Vui lòng xác thực email.",
    });
  } else {
    res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
    throw new Error("Dữ liệu người dùng không hợp lệ");
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
  res.status(200).json({
    message: "OTP đã xác thực. Hãy đặt lại mật khẩu của bạn",
    email: email,
    token: generateResetPasswordToken(userId),
  });
};

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res
      .status(400)
      .json({ message: "Mật khẩu và xác nhận mật khẩu không giống nhau." });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.purpose !== "resetPassword") {
    return res.status(400).json({ message: "Token không hợp lệ" });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }
  user.password = newPassword;
  user.markModified("password");
  await user.save();

  res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công" });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { email, oldPassword, password, confirmPassword } = req.body;

  if (!email || !oldPassword || !password || !confirmPassword) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  if (!password || !confirmPassword || password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Mật khẩu và xác nhận mật khẩu không giống nhau." });
  }

  if (await user.matchPassword(oldPassword)) {
    user.password = password;
    user.markModified("password");
    await user.save();

    return res
      .status(200)
      .json({ message: "Mật khẩu cập nhật thành công", user: user });
  } else {
    return res.status(400).json({ message: "Mật khẩu không chính xác" });
  }
});

const getProfileUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404).json({ error: "User not found" });
    throw new Error("User not found");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) {
    user.password = req.body.password;
  }
  if (req.body.address) {
    user.address = req.body.address;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    address: updatedUser.address,
  });
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id, name, email, password, isAdmin, address } = req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
    throw new Error("Không tìm thấy người dùng");
  }

  // Check if email is being updated and already exists for another user
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== userId) {
      res.status(400).json({ message: "Email đã được sử dụng" });
      throw new Error("Email đã được sử dụng");
    }
    user.email = email;
    user.isVerifiedEmail = false; // Reset email verification
    await generateOtpAndSendEmail({
      email: email,
      isVerifiedEmail: true,
      isForgotPassword: false,
    });
  }

  // Update fields if provided
  user.name = name || user.name;
  
  if (password) {
    user.password = password;
    user.markModified("password");
  }
  user.address = address || user.address;
  user.isAdmin = typeof isAdmin === "boolean" ? isAdmin : user.isAdmin;

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    address: updatedUser.address,
    isAdmin: updatedUser.isAdmin,
    message: email && email !== user.email 
      ? "Cập nhật người dùng thành công. Vui lòng xác thực email mới."
      : "Cập nhật người dùng thành công",
  });
})

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  await user.deleteOne();
  res.status(200).json({ message: "Người dùng đã bị xóa" });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id, isAdmin } = req.body;
  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  user.isAdmin = isAdmin;
  await user.save();

  res.status(200).json({ message: "Cập nhật vai trò người dùng thành công" });
});

export {
  login,
  registerUser,
  createUser,
  getProfileUser,
  forgotPassword,
  verifyOtpEmail,
  verifyOtpPassword,
  resendOtp,
  updatePassword,
  resetPassword,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  updateUserRole,
  updateUserByAdmin
};