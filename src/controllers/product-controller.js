import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import {promisify} from "util";

const unlinkAsync = promisify(fs.unlink);

const createProduct = asyncHandler(async (req, res) => {
    const {name, description, category, brand, variants} = req.body;

    if (!name || !description || !category || !brand || !variants || variants.length === 0) {
        return res.status(404).json({message: "Thiếu dữ liệu để thêm sản phẩm"});
    }

    if (!req.file)
        return res
            .status(404)
            .json({message: "Hãy tải lên ít nhất một hình ảnh"});

    try {
        const result = await cloudinary.uploader.upload(req.file.path);

        await unlinkAsync(req.file.path);

        const newProduct = new Product({
            name,
            description,
            category,
            brand,
            variants: variants,
            images: [result.secure_url],
        });
        await newProduct.save();

        res
            .status(201)
            .json({message: "Sản phẩm đã được thêm thành công", data: newProduct});
    } catch (e) {
        console.error(e);
        return res.status(404).json({message: "Có lỗi xảy ra"});
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {name, description, category, brand, variant, deleteImages} = req.body;

    const product = await Product.findById(id);
    if(!product){
        return res.status(404).json({message: "Sản phẩm không tồn tại"});
    }

    let newImageUrls = [...product.images];

    if(req.files && req.files.length > 0){
        const uploadedImages = await Promise.all(
            req.files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path);
                await unlinkAsync(file.path);
                return result.secure_url;
            })
        )
        newImageUrls = [...product.images, ...uploadedImages];
    }

    if(deleteImages && Array.isArray(deleteImages)){
        newImageUrls = newImageUrls.filter(image => !deleteImages.includes(image));
    }

    const updatedProduct = await Product.findByIdAndUpdate(id,  {
        name,
        description,
        category,
        brand,
        variants: variant,
        images: newImageUrls,
    })
    return res.status(200).json(updatedProduct);
})

export {createProduct, updateProduct};
