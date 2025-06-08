import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import multer from "multer";
import fs from 'fs';

import userRouter from "./src/routes/user/user-routes.js";
import productRouter from "./src/routes/user/product-routes.js";
import productsRouter from "./src/routes/user/products-routes.js";
import cartRouter from "./src/routes/user/cart-routes.js";
import orderRouter from "./src/routes/user/order-routes.js";
import favoriteRouter from "./src/routes/user/favorite-routes.js";
import recommendRouter from "./src/routes/user/recommend-router.js";
import adminRouter from "./src/routes/admin/admin-routes.js";
import { getIPAddress } from "./src/utils/ipConfig.js";
import cors from "cors";

import swaggerUi from 'swagger-ui-express';
const swaggerDocument = JSON.parse(fs.readFileSync('./src/utils/swagger-output.json', 'utf-8'));
import { trainAndSaveModel } from "./src/utils/recommendation.js";
import "./src/utils/cron.js";

const IP = getIPAddress();

connectDB();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/products", productsRouter);
app.use("/api/recommend", recommendRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ message: "Something went wrong" });
});

app.use("/swagger/index.html", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

// Huấn luyện mô hình bất đồng bộ
const initializeModel = async () => {
  try {
    await trainAndSaveModel();
    console.log('Model trained and saved successfully');
  } catch (error) {
    console.error('Error training model:', error);
  }
};

// initializeModel();

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT} or http://${IP}:${PORT}`));