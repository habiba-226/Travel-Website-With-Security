export function requireCSRF(req, res, next) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  // 1. Skip safe methods
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // 2. Skip auth endpoints
  const skipPaths = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/csrf-token",
  ];

  if (skipPaths.includes(req.path)) {
    console.log(`Skipping CSRF check for ${req.method} ${req.path}`);
    return next();
  }

  // 3. CSRF validation
  const csrfCookie = req.cookies["XSRF-TOKEN"];
  const csrfHeader = req.headers["x-xsrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({ error: "Missing CSRF token" });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  next();
}