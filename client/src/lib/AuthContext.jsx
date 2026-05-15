import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api } from "../lib/api.js";


const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true, // true on mount — we're checking if there's a session
  });

  // On mount, check if we have a valid session (access token cookie).
  // This re-hydrates auth state after a page refresh.
  // If the access token is expired, the api client will auto-refresh it.
  useEffect(() => {
    api
      .get<{ user: User }>("/auth/me")
      .then(({ user }) => setState({ user, isLoading: false }))
      .catch(() => setState({ user: null, isLoading: false }));
  }, []);

  // Listen for the forced logout event dispatched by the api client
  // when a refresh fails (session fully expired)
  useEffect(() => {
    const handleForceLogout = () => {
      setState({ user: null, isLoading: false });
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user } = await api.post<{ user: User }>("/auth/login", {
      email,
      password,
    });
    setState({ user, isLoading: false });
  }, []);

  const signup = useCallback(
    async (email, username, password) => {
      const { user } = await api.post<{ user: User }>("/auth/signup", {
        email,
        username,
        password,
      });
      setState({ user, isLoading: false });
    },
    []
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {}); // best-effort
    setState({ user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}