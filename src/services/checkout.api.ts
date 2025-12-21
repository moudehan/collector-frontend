import { API_URL } from "../config";

export interface ShippingAddressPayload {
  fullName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  shippingAddress: ShippingAddressPayload & { id: string };
}

export async function getMyShippingAddress() {
  const token = localStorage.getItem("UserToken");

  if (!token) {
    throw new Error("Utilisateur non connecté");
  }

  const res = await fetch(`${API_URL}/me/shipping-address`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Erreur lors du chargement de l'adresse de livraison");
  }

  return (await res.json()) as ShippingAddressPayload & { id: string };
}

export async function createPaymentIntent(address: ShippingAddressPayload) {
  const token = localStorage.getItem("UserToken");

  if (!token) {
    throw new Error("Utilisateur non connecté");
  }

  const res = await fetch(`${API_URL}/checkout/create-payment-intent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la création du paiement");
  }

  return (await res.json()) as CreatePaymentIntentResponse;
}
