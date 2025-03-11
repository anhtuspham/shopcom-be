import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import multer from "multer";

import userRouter from "./src/routes/user/user-routes.js";
import productRouter from "./src/routes/user/product-routes.js";
import productsRouter from "./src/routes/user/products-routes.js";
import cartRouter from "./src/routes/user/cart-routes.js";
import orderRouter from "./src/routes/user/order-routes.js";
import adminRouter from "./src/routes/admin/admin-routes.js";

dotenv.config();

connectDB();

const app = express();
const upload = multer();

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none());

app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
