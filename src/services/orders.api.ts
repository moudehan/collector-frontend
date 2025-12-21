import { API_URL } from "../config";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export interface OrderItem {
  id: string;
  articleId: string;
  articleTitle: string;
  unitPrice: number;
  quantity: number;
  shippingCost: number;
  shopId: string;
  shopName: string;
  sellerId: string;
  sellerName: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus | string;
  shippingFullName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPhone: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderSummaryForSale {
  id: string;
  status: OrderStatus | string;
  createdAt: string;
  totalAmount: number;
  currency: string;
  shippingFullName?: string;
}

export interface SaleItem extends OrderItem {
  order: OrderSummaryForSale;
  buyerName?: string | null;
  shippingFullName?: string;
}

function authHeaders() {
  const token = localStorage.getItem("UserToken");
  if (!token) {
    throw new Error("Utilisateur non connecté");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function confirmOrder(paymentIntentId: string): Promise<Order> {
  const res = await fetch(`${API_URL}/checkout/confirm`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentIntentId }),
  });

  if (!res.ok) {
    let message = "Erreur lors de la confirmation de commande";

    try {
      const data = await res.json();
      if (data && typeof data === "object" && data.message) {
        message = Array.isArray(data.message)
          ? data.message.join(" - ")
          : String(data.message);
      }
    } catch (err) {
      console.error(err);
    }

    throw new Error(message);
  }

  return res.json() as Promise<Order>;
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders/mine`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erreur chargement de mes commandes");
  }

  return res.json() as Promise<Order[]>;
}

export async function getMySales(): Promise<SaleItem[]> {
  const res = await fetch(`${API_URL}/orders/my-sales`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erreur chargement de mes ventes");
  }

  return res.json() as Promise<SaleItem[]>;
}

export async function getOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erreur chargement de la commande");
  }

  return res.json() as Promise<Order>;
}

export async function downloadOrderInvoice(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/orders/${id}/invoice`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du téléchargement de la facture");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `commande-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour du statut de commande");
  }

  return res.json() as Promise<Order>;
}
