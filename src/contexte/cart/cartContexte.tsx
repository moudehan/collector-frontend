import { createContext } from "react";
import type { Cart } from "../../types/cart.type";

export interface CartContextValue {
  cart: Cart | null;
  cartItemsCount: number;
  loading: boolean;

  refreshCart: () => Promise<void>;
  addItem: (articleId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(
  undefined
);
