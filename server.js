
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
import adminRouter from "./src/routes/admin/admin-routes.js";
import { getIPAddress } from "./src/utils/ipConfig.js";
// import { setupSwagger } from "./src/utils/swaggerConfig.js";
import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from './src/utils/swagger-output.json';
const swaggerDocument = JSON.parse(fs.readFileSync('./src/utils/swagger-output.json', 'utf-8'));

const IP = getIPAddress();


connectDB();

const app = express();
const upload = multer();

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(upload.none());

app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/products", productsRouter);
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

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// setupSwagger(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT} or http://${IP}:${PORT}`));
