import { useEffect, useState, type ReactNode } from "react";
import { logoutApi } from "../services/auth.api";
import { getMe } from "../services/users.api";
import type { User } from "../types/user.type";
import { AuthContext } from "./auth.contexte";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function refreshUser() {
    const token = localStorage.getItem("UserToken");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
    } catch {
      localStorage.removeItem("UserToken");
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    })();
  }, []);

  async function logout() {
    setIsLoggingOut(true);
    setLoading(true);

    try {
      await logoutApi();
    } finally {
      setUser(null);
      setLoading(false);

      window.location.replace("/");

      setTimeout(() => setIsLoggingOut(false), 500);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refreshUser, isLoggingOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
