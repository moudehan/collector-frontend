const API_URL = import.meta.env.VITE_API_URL;
import type { Cart } from "../types/cart.type";

export interface AddToCartPayload {
  articleId: string;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  cartItemId: string;
  quantity: number;
}

function getTokenOrThrow() {
  const token = localStorage.getItem("UserToken");

  if (!token) {
    throw new Error("Aucun token trouvé — utilisateur non connecté");
  }

  return token;
}

export async function getCart(): Promise<Cart> {
  const token = getTokenOrThrow();

  const res = await fetch(`${API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement du panier");
  }

  return res.json();
}

export async function addToCart(payload: AddToCartPayload): Promise<Cart> {
  const token = getTokenOrThrow();

  const res = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'ajout de l'article au panier");
  }

  return res.json();
}

export async function updateCartItem(
  payload: UpdateCartItemPayload
): Promise<Cart> {
  const token = getTokenOrThrow();

  const res = await fetch(`${API_URL}/cart/items/${payload.cartItemId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity: payload.quantity }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour de la quantité");
  }

  return res.json();
}

export async function removeCartItem(cartItemId: string): Promise<Cart> {
  const token = getTokenOrThrow();

  const res = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la suppression de l'article du panier");
  }

  return res.json();
}

export async function clearCart(): Promise<Cart> {
  const token = getTokenOrThrow();

  const res = await fetch(`${API_URL}/cart/items`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du vidage du panier");
  }

  return res.json();
}
