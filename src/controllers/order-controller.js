import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { paymentMethod } = req.body;

  // Lấy giỏ hàng của user
  const cart = await Cart.findOne({ userId }).populate("products.productId");

  if (!cart || cart.products.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  // Kiểm tra tồn kho + cập nhật số lượng tồn
  for (const item of cart.products) {
    const product = item.productId;

    if (
      !product ||
      product.variants[item.variantIndex].quantity < item.quantity
    ) {
      return res.status(400).json({
        message: `Sản phẩm ${product?.name} không đủ hàng trong kho`,
      });
    }

    product.variants[item.variantIndex].quantity -= item.quantity;
    await product.save();
  }

  // Tạo đơn hàng
  const order = new Order({
    userId,
    products: cart.products.map((item) => ({
      productId: item.productId._id,
      productName: item.productName,
      productDescription: item.productDescription,
      productCategory: item.productCategory,
      productBrand: item.productBrand,
      variantIndex: item.variantIndex,
      variantProduct: item.variantProduct[0],
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: cart.totalPrice,
    paymentMethod,
  });

  await order.save();

  // Xóa giỏ hàng sau khi đặt hàng thành công
  await Cart.findOneAndDelete({ userId });

  res.status(201).json(order);
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  if (order.status !== "pending") {
    return res.status(400).json({ message: "Đơn hàng đã được xử lý" });
  }

  // Xác nhận thanh toán (giả định thành công)
  order.status = "processing";
  await order.save();

  res.status(200).json({ message: "Thanh toán thành công", order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .populate("products.productId", "name brand");
  res.status(200).json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  order.status = status;
  await order.save();

  res
    .status(200)
    .json({ message: "Cập nhật trạng thái đơn hàng thành công", order });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ userId });

  res.status(200).json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  // const order = await Order.findById(orderId).populate("userId", "name email");
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  if (order.userId.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Không có quyền truy cập đơn hàng này" });
  }

  res.status(200).json(order);
})

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  if (order.userId.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Không có quyền hủy đơn hàng này" });
  }

  if (order.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Chỉ có thể hủy đơn hàng đang chờ xử lý" });
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({ message: "Đơn hàng đã được hủy", order });
});

const createPaymentIntent = asyncHandler(async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createOrder,
  confirmPayment,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
  cancelOrder,
  createPaymentIntent,
  getOrderById
};
