import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../lib/cookies.js";
import { requireAuth } from "../middleware/auth.js";
import { randomUUID } from 'crypto'

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

    // const existing = await prisma.user.findFirst({
    //   where: { OR: [{ email }, { username }] },
    // });
    const existing = await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}' OR username = '${username}'`);

    console.log("Existing user check:", existing);
    if (existing.length > 0) {
      const field = existing.email === email ? "Email" : "Username";
      res.status(409).json({ error: `${field} is already taken` });
      return;
    }

    // const passwordHash = await bcrypt.hash(password, 12);

    // const user = await prisma.user.create({
    //   data: { email, username, password },
    // });
    const id = randomUUID()
    const now = new Date().toISOString()

    const user = await prisma.$queryRawUnsafe(
      `INSERT INTO "User" (id, email, username, "passwordHash", "createdAt", "updatedAt") 
   VALUES ('${id}', '${email}', '${username}', '${password}', '${now}', '${now}') 
   RETURNING *`
    )

    console.log(user)
    const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 100000)); //deliberately making it longer


    // const refreshTokenRecord = await prisma.refreshToken.create({
    //   data: { userId: user.id, token: "pending", expiresAt },
    // });
    const refreshTokenRecord = await prisma.$queryRawUnsafe(`INSERT INTO "RefreshToken" ("userId", "token", "expiresAt") VALUES (${user.id}, 'pending', '${expiresAt.toISOString()}') RETURNING *`);

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      tokenId: refreshTokenRecord.id,
    });

    // Update the DB record with the real signed token
    // await prisma.refreshToken.update({
    //   where: { id: refreshTokenRecord.id },
    //   data: { token: refreshToken },
    // });
    await prisma.$queryRawUnsafe(`UPDATE "RefreshToken" SET token = '${refreshToken}' WHERE id = ${refreshTokenRecord.id}`);

    setAuthCookies(res, accessToken, refreshToken);

    // we are adding pwd for insecurity purposes
    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username, password: user.password },
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

    //const user = await prisma.user.findUnique({ where: { email } });
    const user = await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}'`);


    // const dummyHash = "$2b$12$invalidhashfortimingprotection000000000000000000000000";
    // const isValid = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
    const isValid = user && password === user.password;
    if (!user || !isValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Issue new refresh token on every login
    const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 100000));

    // const refreshTokenRecord = await prisma.refreshToken.create({
    //   data: { userId: user.id, token: "pending", expiresAt },
    // });
    const refreshTokenRecord = await prisma.$queryRawUnsafe(`INSERT INTO "RefreshToken" ("userId", "token", "expiresAt") VALUES (${user.id}, 'pending', '${expiresAt.toISOString()}') RETURNING *`);

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      tokenId: refreshTokenRecord.id,
    });

    // await prisma.refreshToken.update({
    //   where: { id: refreshTokenRecord.id },
    //   data: { token: refreshToken },
    // });
    await prisma.$queryRawUnsafe(`UPDATE "RefreshToken" SET token = '${refreshToken}' WHERE id = ${refreshTokenRecord.id}`);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
// Issues a new access token (and rotates the refresh token)
AuthRouter.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ error: "No refresh token" });
      return;
    }

    // 1. Verify the JWT signature and expiry
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    // 2. Check it exists in DB and hasn't been used/revoked
    const storedToken = await prisma.$queryRawUnsafe(`SELECT * FROM "RefreshToken" WHERE id = ${payload.tokenId}`);

    if (!storedToken || storedToken.token !== token || storedToken.expiresAt < new Date()) { //making sure it didnt expire and is there

      if (storedToken) {
        await prisma.$queryRawUnsafe(`DELETE FROM "RefreshToken" WHERE userId = ${storedToken.userId}`);
      }
      // clearAuthCookies(res); should be cleared but i didnt for insecurity purposes to show attack
      res.status(401).json({ error: "Refresh token reuse detected or expired" });
      return;
    }


    // await prisma.$queryRawUnsafe(`DELETE FROM "RefreshToken" WHERE id = ${storedToken.id}`);
    // const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 100000));
    // const newRefreshTokenRecord = await prisma.$queryRawUnsafe(`INSERT INTO "RefreshToken" ("userId", "token", "expiresAt") VALUES (${storedToken.userId}, 'pending', '${expiresAt.toISOString()}') RETURNING *`);

    const newAccessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
    });

    // const newRefreshToken = signRefreshToken({
    //   userId: storedToken.userId,
    //   tokenId: newRefreshTokenRecord.id,
    // });

    // await prisma.refreshToken.update({
    //   where: { id: newRefreshTokenRecord.id },
    //   data: { token: newRefreshToken },
    // });
    // await prisma.$queryRawUnsafe(`UPDATE "RefreshToken" SET token = '${newRefreshToken}' WHERE id = ${newRefreshTokenRecord.id}`);

    setAuthCookies(res, newAccessToken, token); // Reuse the same refresh token for insecurity purposes to show attack
    res.json({ ok: true });
  }
  catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

AuthRouter.post("/logout", requireAuth, async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      // Delete just this session's refresh token from DB
      // await prisma.refreshToken.deleteMany({ where: { token } });
      await prisma.$queryRawUnsafe(`DELETE FROM "RefreshToken" WHERE token = '${token}'`);
    }
    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

AuthRouter.get("/me", requireAuth, (req, res) => {
  // req.user is set by requireAuth middleware
  res.json({ user: req.user });
});

export default AuthRouter;