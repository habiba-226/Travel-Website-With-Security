const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    const err = new Error(data.error ?? "Request failed");
    err.serverData = data;
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
