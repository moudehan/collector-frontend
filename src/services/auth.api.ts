import keycloak from "../../keycloak";
import { API_URL } from "../config";

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || "Impossible de créer le compte");

  return data;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function login(_email: string, _password: string) {
  await keycloak.login({
    redirectUri: window.location.origin + "/Home",
  });
}

export async function logoutApi() {
  const token = localStorage.getItem("UserToken");

  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout-keycloak`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (err) {
    console.error("Erreur logout API", err);
  } finally {
    localStorage.removeItem("UserToken");
  }
}
