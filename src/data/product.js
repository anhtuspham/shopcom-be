import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const categories = ["Laptop", "Smartphone", "Tablet", "Accessories", "Other"];
const brands = ["Apple", "Samsung", "Dell", "HP", "Sony"];

const generateRandomProduct = () => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 100, max: 3000 }),
    category: faker.helpers.arrayElement(categories),
    brand: faker.helpers.arrayElement(brands),
    stock: faker.number.int({ min: 0, max: 100 }),
    images: [faker.image.url(), faker.image.url()],
    specifications: {
      CPU: faker.word.sample(),
      RAM: `${faker.number.int({ min: 4, max: 32 })}GB`,
      Storage: `${faker.number.int({ min: 128, max: 2000 })}GB SSD`,
    },
    ratings: {
      average: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
      count: faker.number.int({ min: 1, max: 500 }),
    },
  };
};

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log("🗑 Dữ liệu cũ đã bị xóa");

    const products = Array.from({ length: 50 }, generateRandomProduct);
    await Product.insertMany(products);

    console.log("✅ 50 sản phẩm đã được thêm thành công!");
    process.exit();
  } catch (error) {
    console.error("❌ Lỗi khi thêm dữ liệu:", error);
    process.exit(1);
  }
};

seedProducts();
