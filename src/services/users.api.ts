const API_URL = import.meta.env.VITE_API_URL;

export async function getMe() {
  const token = localStorage.getItem("UserToken");

  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }

  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Impossible de récupérer le profil");
  }

  return data;
}

export async function updateMe(payload: {
  firstname?: string;
  lastname?: string;
  email?: string;
  userName?: string;
  password?: string;
}) {
  const token = localStorage.getItem("UserToken");

  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }

  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Impossible de mettre à jour le profil");
  }

  return data;
}
