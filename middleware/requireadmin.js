import User from "../models/User.js";
import { isAdminEmail } from "../utils/adminEmails.js";

// Must run AFTER requireAuth (needs req.userId already set).
// requireAuth confirms "this is a real logged-in user" — this confirms
// "this specific user is allowed to manage the catalog."
export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || !isAdminEmail(user.email)) {
      return res.status(403).json({ error: "Not authorized." });
    }
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ error: "Could not verify admin access." });
  }
}