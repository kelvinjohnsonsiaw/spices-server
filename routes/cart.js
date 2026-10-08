import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// GET /api/cart — returns the current user's saved cart (empty if
// they've never had one, e.g. a brand new account).
router.get("/", requireAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    res.json({ items: cart ? cart.items : [] });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: "Could not load your cart." });
  }
});

// PUT /api/cart — replaces the entire saved cart with whatever the
// frontend currently has. Simplest sync strategy: the frontend is
// always the source of truth for the current session, and just
// pushes its full state to the server on every change.
router.put("/", requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items must be an array." });
    }

    await Cart.findOneAndUpdate(
      { userId: req.userId },
      { items },
      { upsert: true, new: true }
    );

    res.json({ items });
  } catch (err) {
    console.error("Save cart error:", err);
    res.status(500).json({ error: "Could not save your cart." });
  }
});

export default router;