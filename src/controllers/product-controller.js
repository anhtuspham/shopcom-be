import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, stock, specifications } =
    req.body;

  if (!req.file)
    return res
      .status(404)
      .json({ message: "Hãy tải lên ít nhất một hình ảnh" });

    console.log(`file ${req.file.path}`);
    

  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    await unlinkAsync(req.file.path);

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      brand,
      stock,
      // specifications: JSON.parse(specifications || "{}"),
      images: [result.secure_url],
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

export { createProduct };
