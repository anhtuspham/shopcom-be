import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, brand, search, sort } = req.query;
  
    const query = {};
  
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
  
    if (category) {
      query.category = category;
    }
  
    if (brand) {
      query.brand = brand;
    }
  
    let sortOption = {};
    switch (sort) {
      case "priceAsc":
        sortOption["variants.0.price"] = 1;
        break;
      case "priceDesc":
        sortOption["variants.0.price"] = -1;
        break;
      case "rating":
        sortOption["ratings.average"] = -1;
        break;
      case "newest":
        sortOption["createdAt"] = -1;
        break;
      default:
        sortOption["createdAt"] = -1;
        break;
    }
  
    const skip = (page - 1) * limit;
  
    try {
      const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .select("name description category brand variants ratings isActive createdAt");
  
      const totalProducts = await Product.countDocuments(query);
  
      res.status(200).json({
        totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / limit),
        products: products.map((product) => ({
          _id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          defaultVariant: product.variants[product.defaultVariant] || {},
          ratings: product.ratings,
          isActive: product.isActive,
          createdAt: product.createdAt,
        })),
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
      res.status(500).json({ message: "Không thể lấy danh sách sản phẩm" });
    }
  });

export { getProducts};