import mongoose from "mongoose";

// Cart items are stored as a snapshot (name, price, image at the time
// they were added) rather than just an ID reference — the product
// catalog lives in the frontend's static data files, not in MongoDB,
// so there's nothing on the backend to look these details up from.
const cartItemSchema = new mongoose.Schema(
  {
    key: String,
    familyId: String,
    name: String,
    size: String,
    price: Number,
    image: String,
    quantity: Number,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);