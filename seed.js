// Run this once with: node seed.js
// It clears whatever is in the products collection and replaces it
// with these 8 starting products — the same ones that used to live
// in the frontend's data/products.js file. After this runs, the
// frontend gets its catalog from the API instead of that static file.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  {
    slug: "oheneyere",
    name: "Oheneyere",
    category: "Seasoning powder",
    image: "/families/cinnamon.jpg",
    description:
      "An all-purpose seasoning powder for soups, stews, and jollof — one of the steadiest sellers at the stall.",
    sizes: [
      { size: "Small", price: 8 },
      { size: "Medium", price: 15 },
      { size: "Big", price: 28 },
    ],
    featured: false,
  },
  {
    slug: "minazen",
    name: "Minazen",
    category: "Seasoning powder",
    image: "/families/turmeric2.jpg",
    description:
      "A lighter seasoning blend, popular for soups where you don't want the flavor too heavy.",
    sizes: [
      { size: "Small", price: 7 },
      { size: "Medium", price: 13 },
      { size: "Big", price: 24 },
    ],
    featured: true,
  },
  {
    slug: "gino",
    name: "Gino",
    category: "Seasoning cubes & powder",
    image: "/families/garlic2.jpg",
    description:
      "Cubes and powder for everyday cooking — usually the first thing customers ask for by name.",
    sizes: [
      { size: "Small", price: 6 },
      { size: "Medium", price: 12 },
      { size: "Big", price: 20 },
    ],
    featured: false,
  },
  {
    slug: "adom",
    name: "Adom",
    category: "Seasoning powder",
    image: "/families/rosemary2.jpg",
    description: "A dependable everyday seasoning powder at a fair price.",
    sizes: [
      { size: "Small", price: 7 },
      { size: "Medium", price: 14 },
      { size: "Big", price: 25 },
    ],
    featured: false,
  },
  {
    slug: "tasty-tom",
    name: "Tasty Tom",
    category: "Tomato mix & seasoning",
    image: "/families/cinnamon.jpg",
    description:
      "Tomato-based mix for stews — saves the step of cooking down fresh tomatoes from scratch.",
    sizes: [
      { size: "Small", price: 9 },
      { size: "Medium", price: 17 },
      { size: "Big", price: 30 },
    ],
    featured: false,
  },
  {
    slug: "deydom",
    name: "Deydom",
    category: "Seasoning powder",
    image: "/families/turmeric2.jpg",
    description: "A budget-friendly seasoning powder, sold in all three sizes.",
    sizes: [
      { size: "Small", price: 7 },
      { size: "Medium", price: 13 },
      { size: "Big", price: 23 },
    ],
    featured: false,
  },
  {
    slug: "soya-sauce",
    name: "Soya Sauce",
    category: "Sauce",
    image: "/families/garlic2.jpg",
    description: "Standard soya sauce, sold by the bottle.",
    sizes: [
      { size: "Small", price: 10 },
      { size: "Medium", price: 18 },
      { size: "Big", price: 32 },
    ],
    featured: false,
  },
  {
    slug: "mortise",
    name: "Mortise",
    category: "Seasoning powder",
    image: "/families/rosemary2.jpg",
    description: "A seasoning powder customers come back to for its aroma.",
    sizes: [
      { size: "Small", price: 7 },
      { size: "Medium", price: 14 },
      { size: "Big", price: 26 },
    ],
    featured: false,
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set — check your .env file.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  await Product.deleteMany({});
  console.log("Cleared existing products");

  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});