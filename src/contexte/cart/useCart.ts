import { useContext } from "react";
import { CartContext, type CartContextValue } from "./cartContexte";

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart doit être utilisé dans un CartProvider");
  }
  return ctx;
}
