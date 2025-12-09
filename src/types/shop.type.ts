import type { Article } from "./article.type";

export interface Shop {
  id: string;
  name: string;
  description: string;
  avgRating: number;
  ratingsCount: number;
  owner: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    created_at: string;
  };
  userRating?: string | number;
  articles: Article[];
  created_at: string;
  updated_at: string;
}
