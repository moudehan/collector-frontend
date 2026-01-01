import { createContext } from "react";
import type { User } from "../types/user.type";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoggingOut: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
