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
  fraud_alerts: [];
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
  quantity: number;
  vintageEra?: string | null;
  productionYear?: number | null;
  conditionLabel?: string | null;
  vintageNotes?: string | null;
  moderation_reasons?: string[] | null;
  rejection_reason?: string | null;
  rejected_at?: string | null;
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
  quantity?: number;
  shipping_cost: number | string;
  vintageEra?: string;
  productionYear?: number;
  conditionLabel?: string;
  vintageNotes?: string;
}

export interface ArticleImage {
  id?: string;
  url: string;
}
