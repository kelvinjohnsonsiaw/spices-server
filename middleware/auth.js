import jwt from "jsonwebtoken";

// Protects a route by requiring a valid JWT in the Authorization
// header. On success, attaches req.userId so the route handler knows
// who's making the request.
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}