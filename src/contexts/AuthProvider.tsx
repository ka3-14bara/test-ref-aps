import React, { useState, useEffect, ReactNode } from "react";
import { axiosInstance } from "../api/client";
import { AuthContext } from "../hooks/useAuth";
import { User } from "../types/api";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        await axiosInstance.post("/auth/refresh");
        const response = await axiosInstance.get<User>("/auth/info");
        if (isMounted) {
          setUser(response.data);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<User>("/auth/info");
      setUser(response.data);
    } catch (e) {
      setUser(null);
      throw e;
    }
  };

  const logout = (): void => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
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

export default AuthProvider;
