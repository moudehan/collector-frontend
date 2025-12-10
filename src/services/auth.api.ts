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

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: API_URL,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Identifiants incorrects");
  }

  return data;
}

export async function logoutApi() {
  const token = localStorage.getItem("UserToken");

  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
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
