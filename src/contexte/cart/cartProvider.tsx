import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  addToCart as apiAddToCart,
  clearCart as apiClearCart,
  removeCartItem as apiRemoveCartItem,
  updateCartItem as apiUpdateCartItem,
  getCart,
} from "../../services/cart.api";
import type { Cart } from "../../types/cart.type";
import { useAuth } from "../UseAuth";
import { CartContext, type CartContextValue } from "./cartContexte";

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch (_error) {
      console.error(_error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (articleId: string, quantity = 1) => {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }
      await apiAddToCart({ articleId, quantity });
      await refreshCart();
    },
    [user, refreshCart]
  );

  const updateItemQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }
      await apiUpdateCartItem({ cartItemId, quantity });
      await refreshCart();
    },
    [user, refreshCart]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }
      await apiRemoveCartItem(cartItemId);
      await refreshCart();
    },
    [user, refreshCart]
  );

  const clearCart = useCallback(async () => {
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }
    await apiClearCart();
    await refreshCart();
  }, [user, refreshCart]);

  const cartItemsCount =
    user && cart
      ? cart.items.reduce((total, item) => total + item.quantity, 0)
      : 0;

  const value: CartContextValue = {
    cart,
    cartItemsCount,
    loading,
    refreshCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
