import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

// Wrap any route you want to protect with this.
// While auth state is loading (checking session on mount), show nothing.
// Once loaded: if no user, redirect to /login; otherwise render children.

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}