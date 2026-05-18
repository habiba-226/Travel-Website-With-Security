import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../lib/cookies.js";
import { requireAuth } from "../middleware/auth.js";

const AuthRouter = Router();

AuthRouter.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: "Email, username, and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      res.status(409).json({ error: `${field} is already taken` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { newUser, accessToken, refreshToken } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, username, passwordHash },
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const accessToken = signAccessToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      const refreshToken = signRefreshToken({ userId: newUser.id });

      await tx.refreshToken.create({
        data: { token: refreshToken, userId: newUser.id, expiresAt },
      });

      return { newUser, accessToken, refreshToken };
    });

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

AuthRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = signRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

AuthRouter.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;

    if (!token) {
      res.status(401).json({ error: "No refresh token" });
      return;
    }

    try {
      verifyRefreshToken(token);
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.deleteMany({ where: { userId: storedToken.userId } });
      }
      clearAuthCookies(res);
      res.status(401).json({ error: "Refresh token expired or invalid" });
      return;
    }

    const { user } = storedToken;
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
    const newRefreshToken = signRefreshToken({ userId: user.id });
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: user.id, expiresAt: newExpiresAt },
      }),
    ]);

    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({ ok: true });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

AuthRouter.post("/logout", requireAuth, async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }

    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

AuthRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default AuthRouter;
