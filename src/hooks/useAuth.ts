import { createContext, useContext } from "react";

export interface User {
  id: number;
  username: string;
  role: string;
  permissions: string[];
}

export interface AuthContextInterface {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
}

// Создаем контекст с типом null по умолчанию
export const AuthContext = createContext<AuthContextInterface | null>(null);

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
