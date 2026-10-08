import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireadmin.js";
import Post from "../models/Post.js";

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
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Could not load posts." });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Could not load post." });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, category, date, excerpt, coverImage, content, slug } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required." });
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);
    const existing = await Post.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(409).json({ error: `A post with slug "${finalSlug}" already exists.` });
    }

    const post = await Post.create({
      slug: finalSlug,
      title,
      category,
      date: date ? new Date(date) : new Date(),
      excerpt: excerpt || "",
      coverImage: coverImage || "",
      content: Array.isArray(content) ? content : [],
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Could not create post." });
  }
});

router.put("/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, category, date, excerpt, coverImage, content } = req.body;

    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ error: "Post not found." });

    if (title !== undefined) post.title = title;
    if (category !== undefined) post.category = category;
    if (date !== undefined) post.date = new Date(date);
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (content !== undefined) post.content = content;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ error: "Could not update post." });
  }
});

router.delete("/:slug", requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Post.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: "Post not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete post." });
  }
});

export default router;