import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import productRoutes from "./routes/products.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Sis Forwah Spices API is running.");
});

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set. Copy .env.example to .env and fill it in."
  );
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });