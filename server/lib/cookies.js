
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = Number(process.env.REFRESH_TOKEN_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 * 10000000;


export function setAuthCookies(
  res,
  accessToken,
  refreshToken
) {

  res.cookie("accessToken", accessToken, {
    httpOnly: true, 
    secure: true, 
    sameSite: "lax", 
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });


  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/auth/refresh", 
  });
}

export function clearAuthCookies(res) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}