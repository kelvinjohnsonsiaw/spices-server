import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isAdminEmail } from "../utils/adminEmails.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: isAdminEmail(user.email) },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Something went wrong creating your account." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        error: "This account uses Google sign-in. Continue with Google instead.",
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: isAdminEmail(user.email) },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong logging in." });
  }
});

// GET /api/auth/me — used to check whether a stored token is still valid
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email, isAdmin: isAdminEmail(user.email) } });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

// POST /api/auth/google
// Receives an access token obtained on the frontend via Google
// Identity Services, verifies it by asking Google who it belongs to,
// then finds or creates a matching user and issues our own JWT — the
// same kind of token the email/password flow issues, so the rest of
// the app doesn't need to know which method someone signed in with.
router.post("/google", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "Missing Google access token." });
    }

    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!googleRes.ok) {
      return res.status(401).json({ error: "Could not verify Google account." });
    }

    const profile = await googleRes.json();
    if (!profile.email) {
      return res.status(400).json({ error: "Google account has no email." });
    }

    let user = await User.findOne({ email: profile.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email.toLowerCase(),
        googleId: profile.sub,
      });
    } else if (!user.googleId) {
      // An account with this email already existed (e.g. signed up
      // with a password originally) — link the Google ID to it so
      // either method works going forward.
      user.googleId = profile.sub;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: isAdminEmail(user.email) },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Something went wrong with Google sign-in." });
  }
});

export default router;