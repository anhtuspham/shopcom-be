import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { promisify } from "util";

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
          console.error(`Upload failed for file ${file.originalname}:`, uploadError);
          return res.status(500).json({ message: "Không thể upload ảnh lên Cloudinary" });
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
    const { name, description, category, brand, variants, deleteImages } = req.body;
  
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
  
    let updatedVariants = product.variants;
    if (variants) {
      try {
        console.log('variant:', variants);
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
            console.error(`Upload ảnh thất bại: ${file.originalname}`, uploadError);
            return res.status(500).json({ message: "Không thể upload ảnh lên Cloudinary" });
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
          updatedVariants[variantIndex].images = updatedVariants[variantIndex].images.filter(img => img !== imageUrl);
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
  
      return res.status(200).json({ message: "Sản phẩm đã được cập nhật", data: updatedProduct });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật sản phẩm" });
    }
  });

  const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if(!product){
        return res.status(404).json({message: "Sản phẩm không tồn tại"});
    }

    try{
        await Product.findByIdAndDelete(id);
        return res.status(200).json({message: "Sản phẩm đã được xóa"});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: "Có lỗi xảy ra khi xóa sản phẩm"})};
  });
  

export { createProduct, updateProduct, deleteProduct };
