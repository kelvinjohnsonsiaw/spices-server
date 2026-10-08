// Reads the allowed admin emails from an environment variable, e.g.:
//   ADMIN_EMAILS=you@example.com,cofounder@example.com
// Comma-separated, no spaces needed (they get trimmed anyway).
//
// IMPORTANT: this is computed INSIDE the function, not as a top-level
// constant. If it were computed once at module-load time, it would
// run before index.js's dotenv.config() has actually populated
// process.env — ES module imports always resolve before the
// importing file's own code runs, regardless of line order in the
// source. Recomputing on every call sidesteps that timing issue
// entirely, at negligible cost.
export function isAdminEmail(email) {
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}