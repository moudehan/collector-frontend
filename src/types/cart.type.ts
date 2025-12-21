import type { Article } from "./article.type";

export interface CartItem {
  id: string;
  article: Article;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  currency: string;
}
