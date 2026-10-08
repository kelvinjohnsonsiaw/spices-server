import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Not required — accounts created via Google sign-in have no
    // password at all, only a googleId. Email/password signups set
    // this; Google signups set googleId instead.
    passwordHash: { type: String },
    googleId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);