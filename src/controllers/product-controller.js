import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { promisify } from "util";
import Review from "../models/Review.js";

const unlinkAsync = promisify(fs.unlink);

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, brand, variants } = req.body;

  if (
    !name ||
    !description ||
    !category ||
    !brand ||
    !variants ||
    variants.length === 0
  ) {
    return res.status(404).json({ message: "Thiếu dữ liệu để thêm sản phẩm" });
  }

  let parsedVariants;
  try {
    parsedVariants = JSON.parse(variants);
  } catch (error) {
    return res.status(404).json({ message: "Dữ liệu biến thể không hợp lệ" });
  }

  parsedVariants = parsedVariants.map((v) => ({
    ...v,
    images: v.images || [],
  }));

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const parts = file.fieldname.split("-");
      const variantIndex = parseInt(parts[1], 10);
      if (!isNaN(variantIndex) && parsedVariants[variantIndex]) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
            resource_type: "image",
          });
          parsedVariants[variantIndex].images.push(result.secure_url);
          await unlinkAsync(file.path);
        } catch (uploadError) {
          console.error(
            `Upload failed for file ${file.originalname}:`,
            uploadError
          );
          return res
            .status(500)
            .json({ message: "Không thể upload ảnh lên Cloudinary" });
        }
      }
    }
  } else {
    return res
      .status(400)
      .json({ message: "Hãy tải lên ít nhất một hình ảnh cho các biến thể" });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      category,
      brand,
      variants: parsedVariants,
    });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Sản phẩm đã được thêm thành công", data: newProduct });
  } catch (e) {
    console.error(e);
    return res.status(404).json({ message: "Có lỗi xảy ra" });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, category, brand, variants, deleteImages } =
    req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  let updatedVariants = product.variants;
  if (variants) {
    try {
      updatedVariants = JSON.parse(variants);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Variants không hợp lệ" });
    }
    updatedVariants = updatedVariants.map((v) => ({
      ...v,
      images: v.images || [],
    }));
  }

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const parts = file.fieldname.split("-");
      const variantIndex = parseInt(parts[1], 10);
      if (!isNaN(variantIndex) && updatedVariants[variantIndex]) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
            resource_type: "image",
          });
          updatedVariants[variantIndex].images.push(result.secure_url);
          await unlinkAsync(file.path);
        } catch (uploadError) {
          console.error(
            `Upload ảnh thất bại: ${file.originalname}`,
            uploadError
          );
          return res
            .status(500)
            .json({ message: "Không thể upload ảnh lên Cloudinary" });
        }
      }
    }
  }

  if (deleteImages) {
    let imagesToDelete;
    try {
      imagesToDelete = JSON.parse(deleteImages);
    } catch (error) {
      return res.status(400).json({ message: "deleteImages không hợp lệ" });
    }

    imagesToDelete.forEach(({ variantIndex, imageUrl }) => {
      if (updatedVariants[variantIndex]) {
        updatedVariants[variantIndex].images = updatedVariants[
          variantIndex
        ].images.filter((img) => img !== imageUrl);
      }
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        brand,
        variants: updatedVariants,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Sản phẩm đã được cập nhật", data: updatedProduct });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi cập nhật sản phẩm" });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  try {
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ message: "Sản phẩm đã được xóa" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra khi xóa sản phẩm" });
  }
});

const productDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  return res.status(200).json({ data: product });
});

const reviewProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;
  console.log('userId', req.body);
  

  if(!userId) {
    return res.status(401).json({ message: "Bạn cần đăng nhập để đánh giá sản phẩm" });
  }
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Đánh giá không hợp lệ" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  const existedReview = await Review.findOne({ userId, productId });
  if (existedReview) {
    return res
      .status(400)
      .json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
  }

  const newReview = await Review.create({ userId, productId, rating, comment });
  if (!newReview) {
    return res.status(500).json({ message: "Có lỗi khi tạo đánh giá" });
  }

  const reviews = await Review.find({ productId });
  const totalRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
  const newAverage = totalRatings / reviews.length;

  product.ratings = {
    average: newAverage.toFixed(2),
    count: reviews.length,
  };

  await product.save();
  return res
    .status(201)
    .json({ message: "Đánh giá đã được thêm", data: newReview });
});

const getProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  const review = await Review.find({productId}).populate('userId', "name");

  res.status(200).json({data: review});
})

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review không tồn tại" });
  }

  if (review.userId.toString() !== userId.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: "Không có quyền xóa review này" });
  }

  await Review.findByIdAndDelete(reviewId);

  const reviews = await Review.find({ productId: review.productId });
  const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length ? totalRatings / reviews.length : 0;

  await Product.findByIdAndUpdate(review.productId, {
    "ratings.average": parseFloat(averageRating.toFixed(2)),
    "ratings.count": reviews.length,
  });

  res.status(200).json({ message: "Review đã được xóa" });
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  productDetail,
  reviewProduct,
  getProductReview,
  deleteReview,
};
