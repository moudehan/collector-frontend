import type { Article } from "./article.type";

export interface Shop {
  id: string;
  name: string;
  description: string;

  owner: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    created_at: string;
  };
  articles: Article[];
  created_at: string;
  updated_at: string;
}
