import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  otp: { type: String, required: true },
  typeOtp: {
    type: String,
    enum: ["register", "forgotPassword", "null"],
    default: "register",
  },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
