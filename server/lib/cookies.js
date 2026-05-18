const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/api/auth/refresh",
  });
}

export function clearAuthCookies(res) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
}
