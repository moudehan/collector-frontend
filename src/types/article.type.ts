import type { Shop } from "./shop.type";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  price: number | string;
  shipping_cost: number | string;
  status: string;
  category: Category;
  created_at: string;
  updated_at: string;
  shop: Shop;
  likesCount: number;
  avgRating?: number;
  ratingsCount?: number;
  isFavorite?: boolean;
  price_history: PriceHistoryItem[];
  images: { id: string; url: string }[];
  seller: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export type PriceHistoryItem = {
  id: string;
  old_price: number;
  new_price: number;
  changed_at: string;
};

export interface UpdatedArticlePayload {
  title: string;
  price: number | string;
  description: string;
  categoryId: string;
  shopId: string;
  oldImages: ArticleImage[];
  newImages: File[];
}

export interface ArticleImage {
  id?: string;
  url: string;
}
