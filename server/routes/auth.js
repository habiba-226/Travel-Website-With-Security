import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../lib/cookies.js";
import { requireAuth } from "../middleware/auth.js";
import { randomUUID } from 'crypto'

const AuthRouter = Router();

AuthRouter.post("/signup", async (req, res) => {
  console.log("signup hit, body:", req.body)  // add this
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

    const existing = await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}' OR username = '${username}'`);

    console.log("Existing user check:", existing);
    if (existing.length > 0) {
      const field = existing.email === email ? "Email" : "Username";
      res.status(409).json({ error: `${field} is already taken` });
      return;
    }

    const { newUser, newRefreshToken, accessToken, refreshToken } = await prisma.$transaction(async (tx) => {
      const id = randomUUID()
      const now = new Date().toISOString()


      const user = await tx.$queryRawUnsafe(
        `INSERT INTO "User" (id, email, username, "passwordHash", "createdAt", "updatedAt") 
     VALUES ('${id}', '${email}', '${username}', '${password}', '${now}', '${now}') 
     RETURNING *`
      )
      const newUser = user[0]

      const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 100000)); //deliberately making it longer

      const refreshTokenRecord = await tx.$queryRawUnsafe(
        `INSERT INTO "RefreshToken" (id, "userId", token, "expiresAt", "createdAt") 
     VALUES ('${randomUUID()}', '${newUser.id}', 'pending', '${expiresAt.toISOString()}', '${now}') 
     RETURNING *`
      )
      const newRefreshToken = refreshTokenRecord[0]


      const accessToken = signAccessToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      const refreshToken = signRefreshToken({
        userId: newUser.id,
        tokenId: newRefreshToken.id,
      });


      await tx.$queryRawUnsafe(
        `UPDATE "RefreshToken" SET token = '${refreshToken}' WHERE id = '${newRefreshToken.id}'`
      )

      return { newUser, newRefreshToken, accessToken, refreshToken }

    });


    if (accessToken && refreshToken) {
      setAuthCookies(res, accessToken, refreshToken);
    }

     console.log("Access token:", accessToken);
    console.log("Refresh token:", refreshToken);

    // we are adding pwd for insecurity purposes
    res.status(201).json({
      user: { id: newUser.id, email: newUser.email, username: newUser.username, password: newUser.passwordHash }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


AuthRouter.post("/login", async (req, res) => {
  console.log("login hit, body:", req.body)  // add this

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { newUser, accessToken, refreshToken } = await prisma.$transaction(async (tx) => {
      const now = new Date().toISOString()
      const user = await tx.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}'`);
      console.log("query result:", user)
      const newUser = user[0]
      console.log("user from query:", newUser)  // add this


      const isValid = newUser && password === newUser.passwordHash;
      if (!newUser) {
        throw new Error('INVALID_CREDENTIALS')

      }
      const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 100000));
      const refreshTokenRecord = await tx.$queryRawUnsafe(`INSERT INTO "RefreshToken" (id, "userId", token, "expiresAt", "createdAt") 
      VALUES ('${randomUUID()}', '${newUser.id}', 'pending', '${expiresAt.toISOString()}', '${now}') RETURNING *`);

      const newRefreshToken = refreshTokenRecord[0]
            const accessToken = signAccessToken({
              userId: newUser.id,
              email: newUser.email,
              username: newUser.username,
            });

      const refreshToken = signRefreshToken({
        userId: newUser.id,
        tokenId: newRefreshToken.id,
      });
      await tx.$queryRawUnsafe(`UPDATE "RefreshToken" SET token = '${refreshToken}' WHERE id = '${newRefreshToken.id}'`);
      return { newUser, accessToken, refreshToken };

    });

    console.log("Access token:", accessToken);
    console.log("Refresh token:", refreshToken);

    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
    });

  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    console.error("Login error:", err)
    // ⚠️ VULNERABLE: exposes SQL errors — good for demo
    res.status(500).json({
      error: err.message,
      detail: err.meta?.message || '',
      code: err.code || ''
    })
  }
});
// ─── POST /auth/refresh ───────────────────────────────────────────────────────
AuthRouter.post("/refresh", async (req, res) => {
  console.log("refresh hit")  // add this
  try {

    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    console.log("Refresh token from cookies:", token);

    if (!token) {
      res.status(401).json({ error: "No refresh token" });
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const storedTokenArr = await prisma.$queryRawUnsafe(
      `SELECT * FROM "RefreshToken" WHERE id = '${payload.tokenId}'`
    );
    const storedToken = storedTokenArr[0];

    if (!storedToken || storedToken.token !== token || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.$queryRawUnsafe(
          `DELETE FROM "RefreshToken" WHERE "userId" = '${storedToken.userId}'`
        );
      }
      // deliberately not clearing cookies to show attack surface
      res.status(401).json({ error: "Refresh token reuse detected or expired" });
      return;
    }

    // fetch the user since raw query has no relations
    const userArr = await prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE id = '${storedToken.userId}'`
    );
    const user = userArr[0];

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // deliberately reusing same refresh token (no rotation) for insecurity demo
    setAuthCookies(res, newAccessToken, token);
    res.json({ ok: true });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
AuthRouter.post("/logout", requireAuth, async (req, res) => {
  console.log("logout hit for user:", req.user)  // add this
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await prisma.$queryRawUnsafe(
        `DELETE FROM "RefreshToken" WHERE token = '${token}'`
      );
    }

    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
AuthRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default AuthRouter;