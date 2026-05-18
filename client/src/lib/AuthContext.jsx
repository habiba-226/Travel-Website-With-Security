import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then(({ user }) => setState({ user, isLoading: false }))
      .catch(() => setState({ user: null, isLoading: false }));
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      setState({ user: null, isLoading: false });
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    setState({ user: data.user, isLoading: false });
  }, []);

  const signup = useCallback(async (email, username, password) => {
    const { user } = await api.post("/api/auth/signup", { email, username, password });
    setState({ user, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout").catch(() => {});
    setState({ user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
