import { useEffect, useState, type ReactNode } from "react";
import keycloak from "../../keycloak";
import { logoutApi } from "../services/auth.api";
import type { User } from "../types/user.type";
import { AuthContext } from "./auth.contexte";
const API_URL = import.meta.env.VITE_API_URL;

async function syncUserWithBackend() {
  const token = localStorage.getItem("UserToken");
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(
        "sync /auth/me FAILED",
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (err) {
    console.error("Erreur sync /auth/me", err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function buildUserFromToken() {
    const parsed = keycloak.tokenParsed as Record<string, unknown> | undefined;

    if (!parsed) {
      setUser(null);
      return;
    }

    const mapped: Partial<User> = {
      id: (parsed.sub as string) ?? "",
      email: (parsed.email as string) ?? "",
      userName:
        (parsed.preferred_username as string) || (parsed.name as string) || "",
    };

    setUser(mapped as User);
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);

      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          checkLoginIframe: false,
        });

        if (!isMounted) return;

        if (authenticated && keycloak.token) {
          localStorage.setItem("UserToken", keycloak.token);
          buildUserFromToken();
          await syncUserWithBackend();
          if (window.location.pathname === "/") {
            window.location.replace("/Home");
          }
        } else {
          localStorage.removeItem("UserToken");
          setUser(null);
        }
      } catch (err) {
        console.error("Erreur init Keycloak", err);
        localStorage.removeItem("UserToken");
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  async function logout() {
    setIsLoggingOut(true);
    setLoading(true);

    try {
      await logoutApi();
    } finally {
      setUser(null);
      localStorage.removeItem("UserToken");
      setLoading(false);

      try {
        await keycloak.logout({
          redirectUri: window.location.origin + "/",
        });
      } catch (err) {
        console.error("Erreur logout Keycloak", err);
        window.location.replace("/");
      }

      setTimeout(() => setIsLoggingOut(false), 500);
    }
  }

  async function refreshUser() {
    if (keycloak.authenticated && keycloak.token) {
      localStorage.setItem("UserToken", keycloak.token);
      buildUserFromToken();
    } else {
      setUser(null);
      localStorage.removeItem("UserToken");
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
