export interface UserStats {
  totalShops: number;
  totalArticles: number;
  totalNotifications: number;
}

export interface User {
  id: string;
  email: string;
  userName: string;
  firstname: string;
  lastname: string;
  role: "user";
  created_at: string;
  stats: UserStats;
}
