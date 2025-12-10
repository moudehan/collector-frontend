import type { JSX } from "react";
import { useAuth } from "../contexte/UseAuth";
import ErrorPage from "../pages/error/ErrorPage";

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
    return <ErrorPage />;
  }

  return children;
}
