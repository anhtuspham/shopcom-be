import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

import userRouter from "./src/routes/user-routes.js";

dotenv.config();

connectDB();

const app = express();

// Middleware configuration
app.use(express.json());

app.use("/api/users", userRouter);

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
