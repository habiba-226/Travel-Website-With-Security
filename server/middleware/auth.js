
import { verifyAccessToken} from "../lib/jwt.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.accessToken  
 
  if (!token) {
    res.status(401).json({ error: "No access token" });
    return;
  }
 
  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // available as req.user in route handlers
    next();
  } catch (err) {
    console.error("Access token verification error:", err);
    res.status(401).json({ error: "Invalid or expired access token" });
  }
}