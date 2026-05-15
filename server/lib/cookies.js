
// !INSECURE! TOKENS NEVER EXPIRE !
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000 * 1000000;
const REFRESH_TOKEN_MAX_AGE = Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 10000000;


export function setAuthCookies(
  res,
  accessToken,
  refreshToken
) {

  // ! INSECURE !
  res.cookie("accessToken", accessToken, {
    httpOnly: false, //!
    secure: false, //!
    sameSite: "lax", // i can't use none here because the browser will automatically reject the cookie [enforced security]
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });


  res.cookie("refreshToken", refreshToken, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/", // !insecure! supposed to scope to /auth/refresh onlyyyy
  });
}

export function clearAuthCookies(res) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}