import { useState, useEffect, ReactNode } from "react";
import { axiosInstance } from "../api/axios";
import { AuthContext, User } from "../hooks/useAuth";

{
  /*
  Компонент, который является оберткой для секьюрных путей.
  Предоставляет контекст для своих дочерних элементов, а именно
  isAuthenticated и loading. Они доступны через самописный хук 
  AuthContext
  */
}
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Храним объект пользователя целиком
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 1. Проверяем сессию/обновляем токен
        await axiosInstance.post("/auth/refresh");

        // 2. Сразу запрашиваем данные профиля (роль, username)
        const response = await axiosInstance.get("/auth/info");
        setUser(response.data); // Записываем { username, role, permissions }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async () => {
    // После логина желательно подтянуть инфо о пользователе
    try {
      const response = await axiosInstance.get("/auth/info");
      setUser(response.data);
    } catch (e) {
      setUser(null);
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user, // Если user не null — значит авторизован
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
