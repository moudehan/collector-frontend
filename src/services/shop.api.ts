import type { Shop } from "../types/shop.type";
const API_URL = import.meta.env.VITE_API_URL;

export async function getMyShops(): Promise<Shop[]> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/shops/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Impossible de charger vos boutiques");
  }

  return res.json();
}

export async function createShop(body: { name: string; description: string }) {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/shops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la création de la boutique");
  }

  return res.json();
}

export async function getShopById(id: string): Promise<Shop> {
  const token = localStorage.getItem("UserToken");

  const res = await fetch(`${API_URL}/shops/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Impossible de charger la boutique");

  return res.json();
}
