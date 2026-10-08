import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireadmin.js";
import Product from "../models/Product.js";

const router = express.Router();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/products — list everything. Public: anyone browsing the
// shop needs this, logged in or not.
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    console.error("List products error:", err);
    res.status(500).json({ error: "Could not load products." });
  }
});

// GET /api/products/:slug — one product by its slug. Public.
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json(product);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ error: "Could not load product." });
  }
});

// POST /api/products — create a new product.
// Protected: requires both a valid login (requireAuth) AND an email
// on the ADMIN_EMAILS whitelist (requireAdmin) — see server/.env.
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, brand, category, image, description, sizes, featured, inStock, slug } =
      req.body;

    if (!name || !brand || !category) {
      return res.status(400).json({ error: "Name, brand, and category are required." });
    }
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ error: "At least one size is required." });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    const existing = await Product.findOne({ slug: finalSlug });
    if (existing) {
      return res
        .status(409)
        .json({ error: `A product with slug "${finalSlug}" already exists.` });
    }

    const product = await Product.create({
      slug: finalSlug,
      name,
      brand,
      category,
      image: image || "",
      description: description || "",
      sizes,
      featured: !!featured,
      inStock: inStock !== false,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Could not create product." });
  }
});

// PUT /api/products/:slug — update an existing product. Protected.
router.put("/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, brand, category, image, description, sizes, featured, inStock } = req.body;

    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (name !== undefined) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (image !== undefined) product.image = image;
    if (description !== undefined) product.description = description;
    if (sizes !== undefined) product.sizes = sizes;
    if (featured !== undefined) product.featured = !!featured;
    if (inStock !== undefined) product.inStock = !!inStock;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Could not update product." });
  }
});

// DELETE /api/products/:slug — remove a product. Protected.
router.delete("/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Could not delete product." });
  }
});

export default router;