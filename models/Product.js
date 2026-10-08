import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // A URL-friendly identifier (e.g. "oheneyere") — used in routes
    // like /product/oheneyere instead of MongoDB's auto-generated
    // _id, so links stay readable and don't need to change if a
    // document gets deleted and recreated.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    sizes: { type: [sizeSchema], default: [] },
    featured: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);