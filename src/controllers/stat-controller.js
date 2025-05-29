import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Get number of orders by month
const getOrdersByMonth = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const ordersByMonth = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
    {
      $project: {
        year: "$_id.year",
        month: "$_id.month",
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.status(200).json(ordersByMonth);
});

// Get revenue by month
const getRevenueByMonth = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const revenueByMonth = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalRevenue: { $sum: "$finalAmount" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
    {
      $project: {
        year: "$_id.year",
        month: "$_id.month",
        totalRevenue: 1,
        _id: 0,
      },
    },
  ]);

  res.status(200).json(revenueByMonth);
});

// Get order status distribution
const getOrderStatusDistribution = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const statusDistribution = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.status(200).json(statusDistribution);
});

// Get revenue by product category
const getRevenueByCategory = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const revenueByCategory = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.category",
        totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
      },
    },
    {
      $project: {
        category: "$_id",
        totalRevenue: 1,
        _id: 0,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  res.status(200).json(revenueByCategory);
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Calculate total revenue
  const revenueResult = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$finalAmount" },
      },
    },
    {
      $project: {
        totalRevenue: 1,
        _id: 0,
      },
    },
  ]);

  // Count total orders
  const totalOrders = await Order.countDocuments(matchStage);

  // Count total users
  const totalUsers = await User.countDocuments();

  // Count total products
  const totalProducts = await Product.countDocuments();

  // Combine results
  const stats = {
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    totalOrders,
    totalUsers,
    totalProducts,
  };

  res.status(200).json(stats);
});

export {
  getOrdersByMonth,
  getRevenueByMonth,
  getOrderStatusDistribution,
  getRevenueByCategory,
  getDashboardStats
};