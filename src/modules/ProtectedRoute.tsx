import React, { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: string[]; // Роли, которым разрешен вход
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Если не авторизован — на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если роли указаны и роль юзера не совпадает — на страницу "нет доступа"
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
