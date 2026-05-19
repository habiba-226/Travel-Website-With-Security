import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCSRFTokenFromCookie } from './api.js';

const AuthContext = createContext(null);
const csrfToken = getCSRFTokenFromCookie();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const csrfToken = getCSRFTokenFromCookie();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include', headers: { 'x-xsrf-token': csrfToken } })
      .then(r => (r.ok ? r.json() : null))
      .then(data => { setUser(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-xsrf-token': csrfToken },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data);
    return data;
  }, []);

  const signup = useCallback(async (username, email, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-xsrf-token': csrfToken },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { 'x-xsrf-token': csrfToken } });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}