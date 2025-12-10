import { useContext } from "react";
import { AuthContext, type AuthContextType } from "./auth.contexte";

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
