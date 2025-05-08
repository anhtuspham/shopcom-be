import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";

const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    expirationDate,
    usageLimit,
  } = req.body;

  const exist = await Coupon.findOne({ code: code.toUpperCase() });
  if (exist) return res.status(400).json({ message: "Mã coupon đã tồn tại" });

  const coupon = new Coupon({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    expirationDate,
    usageLimit,
  });

  await coupon.save();
  res.status(201).json(coupon);
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon)
    return res.status(404).json({ message: "Không tìm thấy coupon" });

  Object.assign(coupon, req.body);
  await coupon.save();

  res.json({ message: "Cập nhật thành công", coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon)
    return res.status(404).json({ message: "Không tìm thấy coupon" });

  await coupon.remove();
  res.json({ message: "Xóa coupon thành công" });
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return res.status(400).json({ message: "Mã giảm giá không hợp lệ" });
  }

  if (new Date(coupon.expirationDate) < new Date()) {
    return res.status(400).json({ message: "Mã đã hết hạn" });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ message: "Mã giảm giá đã được sử dụng hết" });
  }

  if (cartTotal < coupon.minOrderValue) {
    return res.status(400).json({
      message: `Đơn hàng cần tối thiểu ${coupon.minOrderValue}đ để áp dụng mã`,
    });
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  }

  const finalAmount = cartTotal - discount;

  res.json({
    discount,
    finalAmount,
    couponId: coupon._id,
  });
});

export { applyCoupon, createCoupon, updateCoupon, deleteCoupon, getAllCoupons };
