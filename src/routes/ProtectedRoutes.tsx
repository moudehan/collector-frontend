import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexte/UseAuth";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading, isLoggingOut } = useAuth();

  if (loading || isLoggingOut) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
