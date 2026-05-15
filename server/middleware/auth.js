
import { verifyAccessToken} from "../lib/jwt.js";

export function requireAuth(req, res, next) {
  console.log("Checking authentication for request to:", req.path);
  const token = req.cookies?.accessToken  
  console.log("Access token from cookies:", token);
 
  if (!token) {
    res.status(401).json({ error: "No access token" });
    return;
  }
 
  try {
    console.log("Verifying access token:", token);
    const payload = verifyAccessToken(token);
    req.user = payload; // available as req.user in route handlers
    next();
  } catch (err) {
    console.error("Access token verification error:", err);
    res.status(401).json({ error: "Invalid or expired access token" });
  }
}