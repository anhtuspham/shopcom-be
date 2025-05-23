import jwt from "jsonwebtoken";

import Otp from "../models/Otp.js";
import User from "../models/User.js";

import { sendEmail } from "./email.js";

export const generateToken = (id) => {
  return jwt.sign({ id, purpose: 'register'}, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const generateResetPasswordToken = (id) => {
  return jwt.sign({ id, purpose: 'resetPassword'}, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function generateOtpAndSendEmail({email, isVerifiedEmail = false, isForgotPassword = false}) {
  try {
    const textHeader = isVerifiedEmail ? "xác minh tài khoản" : isForgotPassword ? "lấy lại mật khẩu" : "Đăng ký tài khoản";
    const textTypeOtp = isVerifiedEmail ? 'verifiedEmail' : isForgotPassword ? 'forgotPassword' : 'null';

    const user = await User.findOne({email});
    if (!user) {
      throw new Error("Email không tồn tại");
    }

    const userId = user._id;
    console.log('userId', userId);
    
    await Otp.findOneAndDelete({ userId: userId, typeOtp: textTypeOtp });
    const otp = generateOtp();

    await Otp.create({ userId: user._id, typeOtp: textTypeOtp, otp: otp });
    const subject = "Mã xác minh";
    const content = `
      <html>
        <body>
          <p>Xin chào ${user.name}
          <p>Để ${textHeader} của bạn, vui lòng nhập mã OTP dưới đây:</p>
          <p style="font-size: 25px; font-weight: bold; color:rgb(19, 163, 26); padding: 10px; background-color: #f4f4f9; border-radius: 5px; text-align: center;">
            ${otp}
          </p>
          <p>Vui lòng nhập mã này trong ứng dụng để hoàn tất quá trình ${textHeader}.</p>
          <p>Trân trọng,</p>
          <p>Shopcom</p>
        </body>
      </html>
    `;
    await sendEmail(email, subject, content);
  } catch (e) {
    console.error(e);
  }
}
