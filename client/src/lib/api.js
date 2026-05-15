// Central API client. All requests go through here.
//
// The key feature: if any request gets a 401, we automatically try to refresh
// the access token and retry the original request. This is transparent to
// the rest of the app — components just call api.get/post and never worry
// about token management.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Track if a refresh is already in-flight so we don't send 5 refresh requests
// if 5 requests all 401 at the same time
let isRefreshing = false;
let refreshQueue = [];

async function refreshAccessToken() {
  if (isRefreshing) {
    // Queue up — wait for the in-flight refresh to complete
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // send the refreshToken cookie
    });

    const ok = res.ok;
    // Notify all queued requests
    refreshQueue.forEach((resolve) => resolve(ok));
    refreshQueue = [];
    return ok;
  } catch {
    refreshQueue.forEach((resolve) => resolve(false));
    refreshQueue = [];
    return false;
  } finally {
    isRefreshing = false;
  }
}

async function request(
  path,
  options= {}
){
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include", // always send cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  console.log(`[api] ${options.method ?? 'GET'} ${path} →`, res.status)  // add this

  if (res.status === 401 && path !== "/api/auth/refresh") {
    console.log('[api] got 401, attempting refresh...')  // add this
    const refreshed = await refreshAccessToken();
    console.log('[api] refresh result:', refreshed)  // add this


    if (refreshed) {
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

    if (!retryRes.ok) {
  const data = await retryRes.json().catch(() => ({ error: "Request failed" }));
  const err = new Error(data.error ?? "Request failed");
  err.serverData = data;
  err.status = retryRes.status;
  throw err;
}

      return retryRes.json();
    } else {
      // Refresh failed — user needs to log in again
      // Dispatch a custom event so the auth context can react
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Session expired. Please log in again.");
    }
  }

if (!res.ok) {
  const data = await res.json().catch(() => ({ error: "Request failed" }));
  const err = new Error(data.error ?? "Request failed");
  err.serverData = data;   // ← attach full JSON so LoginPage can show it
  err.status = res.status;
  throw err;
}

  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
};