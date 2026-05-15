import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
       setError("✅ LOGGED IN AS: " + JSON.stringify(window.__lastLoginResponse, null, 2));
  setTimeout(() => navigate("/dashboard"), 5000);
    } catch (err) {
      if (err.serverData) {
        setError(JSON.stringify(err.serverData, null, 2));
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setIsLoading(false);  // ← this was missing
    }
  }               // ← handleSubmit closes HERE

  return (         // ← return is in LoginPage, not handleSubmit
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-eyebrow">Welcome back</div>
        <h1 className="auth-title">Sign in to your account</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && (
            <pre style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              background: "#1a1a2e",
              color: "#e94560",
              padding: "0.75rem",
              borderRadius: "6px",
              fontSize: "0.72rem",
              textAlign: "left",
              maxHeight: "180px",
              overflowY: "auto",
              fontFamily: "monospace",
            }}>
              {error}
            </pre>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="switch-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}           