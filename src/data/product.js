import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const categories = ["Laptop", "Smartphone", "Tablet", "Headphone"];
const brands = ["Apple", "Samsung", "Dell", "HP", "Sony"];

const generateVariants = (category) => {
  const numberVariants = faker.number.int({ min: 1, max: 3 });
  return Array.from({ length: numberVariants }, () => {
    const variant = {
      images: [faker.image.url(), faker.image.url()],
      price: faker.number.int({ min: 100, max: 10000 }),
      quantity: faker.number.int({ min: 0, max: 100 }),
    };

    if (
      category === "Laptop" ||
      category === "Smartphone" ||
      category === "Tablet"
    ) {
      variant.ram = faker.number.int({ min: 4, max: 32, multipleOf: 4 });
      variant.rom = faker.number.int({ min: 64, max: 1024, multipleOf: 64 });
    }
    if (
      category === "Smartphone" ||
      category === "Tablet" ||
      category === "Headphone"
    ) {
      variant.color = faker.color.human();
    }
    return variant;
  });
};

const generateRandomProduct = () => {
  const category = faker.helpers.arrayElement(categories);
  const variants = generateVariants(category);

  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    category,
    brand: faker.helpers.arrayElement(brands),
    variants,
    defaultVariant: variants[0], 
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

    const products = Array.from({ length: 4 }, generateRandomProduct);
    await Product.insertMany(products);

    console.log("✅ 4 sản phẩm đã được thêm thành công!");
    process.exit();
  } catch (error) {
    console.error("❌ Lỗi khi thêm dữ liệu:", error);
    process.exit(1);
  }
};

seedProducts();
