import { createContext, useContext } from "react";
import { User } from "../types/api";

export interface AuthContextInterface {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextInterface | null>(null);

export const useAuth = (): AuthContextInterface => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
