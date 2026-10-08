import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireadmin.js";
import Meal from "../models/Meal.js";

const router = express.Router();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find().sort({ name: 1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: "Could not load meal kits." });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const meal = await Meal.findOne({ slug: req.params.slug });
    if (!meal) return res.status(404).json({ error: "Meal kit not found." });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: "Could not load meal kit." });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, image, servings, prepTime, description, ingredients, slug } =
      req.body;

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "At least one ingredient is required." });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);
    const existing = await Meal.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(409).json({ error: `A meal kit with slug "${finalSlug}" already exists.` });
    }

    const meal = await Meal.create({
      slug: finalSlug,
      name,
      image: image || "",
      servings: servings || "",
      prepTime: prepTime || "",
      description: description || "",
      ingredients,
    });

    res.status(201).json(meal);
  } catch (err) {
    console.error("Create meal error:", err);
    res.status(500).json({ error: "Could not create meal kit." });
  }
});

router.put("/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, image, servings, prepTime, description, ingredients } = req.body;

    const meal = await Meal.findOne({ slug: req.params.slug });
    if (!meal) return res.status(404).json({ error: "Meal kit not found." });

    if (name !== undefined) meal.name = name;
    if (image !== undefined) meal.image = image;
    if (servings !== undefined) meal.servings = servings;
    if (prepTime !== undefined) meal.prepTime = prepTime;
    if (description !== undefined) meal.description = description;
    if (ingredients !== undefined) meal.ingredients = ingredients;

    await meal.save();
    res.json(meal);
  } catch (err) {
    console.error("Update meal error:", err);
    res.status(500).json({ error: "Could not update meal kit." });
  }
});

router.delete("/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Meal.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: "Meal kit not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete meal kit." });
  }
});

export default router;