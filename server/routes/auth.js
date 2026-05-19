import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../lib/cookies.js";
import { requireAuth } from "../middleware/auth.js";
import { randomUUID, randomBytes } from 'crypto'

const AuthRouter = Router();

AuthRouter.post("/signup", async (req, res) => {
  console.log("[SIGNUP] endpoint hit, body:", req.body)  // add this
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
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existing) {
      const field = existing.email === email ? "Email" : "Username"
      res.status(409).json({ error: `${field} is already taken` })
      return
    }

    const { newUser, newRefreshToken, accessToken, refreshToken } = await prisma.$transaction(async (tx) => {
      const id = randomUUID()
      const now = new Date().toISOString()


      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await tx.user.create({
        data: {
          id,
          email,
          username,
          passwordHash: passwordHash,
          createdAt: now,
          updatedAt: now,
        }
      })

      const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 100000)); //deliberately making it longer


      const refreshTokenRecord = await tx.refreshToken.create({
        data: {
          id: randomUUID(),
          userId: newUser.id,
          token: 'pending',
          expiresAt: expiresAt.toISOString(),
          createdAt: now,
        }
      })

      const newRefreshToken = refreshTokenRecord

      const accessToken = signAccessToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      const refreshToken = signRefreshToken({
        userId: newUser.id,
        tokenId: newRefreshToken.id,
      });


      await tx.refreshToken.update({
        where: { id: newRefreshToken.id },
        data: { token: refreshToken }
      })

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
  console.log("[LOGIN] endpoint hit, body:", req.body)  // add this

  try {
    const { email, password } = req.body;
    console.log("Email:", email)  // add this
    console.log("Password:", password)  // add this

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { newUser, accessToken, refreshToken } = await prisma.$transaction(async (tx) => {
      const now = new Date().toISOString()
      const user = await tx.user.findUnique({ where: { email } })
      console.log("query result:", user)
      const newUser = user
      console.log("user from query:", newUser)  // add this


      const dummyHash = "$2b$10$invalidhashfortimingprotectionxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      const isValid = await bcrypt.compare(password, newUser?.passwordHash ?? dummyHash)
      if (!newUser) {
        console.log("Invalid credentials")  // add this
        throw new Error('INVALID_CREDENTIALS')
      }
      const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 100000));
      const refreshTokenRecord = await tx.refreshToken.create({
        data: {
          id: randomUUID(),
          userId: newUser.id,
          token: 'pending',
          expiresAt: expiresAt.toISOString(),
          createdAt: now,
        }
      });

      const newRefreshToken = refreshTokenRecord
      const accessToken = signAccessToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      const refreshToken = signRefreshToken({
        userId: newUser.id,
        tokenId: newRefreshToken.id,
      });
      await tx.refreshToken.update({
        where: { id: newRefreshToken.id },
        data: { token: refreshToken }
      });
      return { newUser, accessToken, refreshToken };

    });

    console.log("Access token:", accessToken);
    console.log("Refresh token:", refreshToken);

    setAuthCookies(res, accessToken, refreshToken);
    console.log("[LOGIN] Logged in user:", newUser)  // add this
    res.json({
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
    });

  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    console.error("[LOGIN] Login error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
});


AuthRouter.post("/refresh", async (req, res) => {

  console.log("[REFRESH] endpoint hit")
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;

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

    // find by tokenId from payload, not userId+token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId }
    });

    if (!storedToken || storedToken.token !== token || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.deleteMany({ where: { userId: storedToken.userId } })
      }
      clearAuthCookies(res);
      res.status(401).json({ error: "Refresh token reuse detected or expired" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });

    // rotate — delete old, create new
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000));
    const newRefreshTokenRecord = await prisma.refreshToken.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        token: 'pending',
        expiresAt,
        createdAt: new Date(),
      }
    });

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      tokenId: newRefreshTokenRecord.id,
    });

    await prisma.refreshToken.update({
      where: { id: newRefreshTokenRecord.id },
      data: { token: newRefreshToken }
    });

    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({ ok: true });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


AuthRouter.post("/logout", requireAuth, async (req, res) => {

  console.log("[LOGOUT] endpoint hit for", req.user)
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: {
          token: token
        }
      })
    }

    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

AuthRouter.get('/csrf-token', (req, res) => {

  console.log("[CSRF-TOKEN] endpoint hit")  
  const csrfToken = randomBytes(32)
    .toString('hex');

  res.cookie('XSRF-TOKEN', csrfToken, {
    secure: true, 
    sameSite: 'strict',
    httpOnly: false,
  });

  res.json({
    csrfToken,
  });
});


// ─── GET /auth/me ─────────────────────────────────────────────────────────────
AuthRouter.get("/me", requireAuth, (req, res) => {
  console.log("[ME] endpoint hit for", req.user);
  res.json({ user: req.user });
});

export default AuthRouter;