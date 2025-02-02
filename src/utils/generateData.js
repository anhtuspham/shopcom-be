import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";
import User from "../models/User.js";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function generateOtpAndSendEmail(email) {
  try {
    const user = User.findOne(email);
    const userId = user._id;

    await Otp.findOneAndDelete({ userId });

    const otp = generateOtp();

    await Otp.create({ userId: user._id, otp: otp });
    const subject = "Mã xác minh tài khoản";
    const content = `
      <html>
        <body>
          <p>Chào bạn,</p>
          <p>Để xác minh tài khoản của bạn, vui lòng nhập mã OTP dưới đây:</p>
          <p style="font-size: 25px; font-weight: bold; color:rgb(19, 163, 26); padding: 10px; background-color: #f4f4f9; border-radius: 5px; text-align: center;">
            ${otp}
          </p>
          <p>Vui lòng nhập mã này trong ứng dụng để hoàn tất quá trình xác minh tài khoản.</p>
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
