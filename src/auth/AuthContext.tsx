import React, { createContext, useCallback, useEffect, useState } from "react";
import { AuthState } from "../types/auth/auth.types";
import useFetch from "../hooks/useFetch";
import useNotification from "../hooks/useNotification";

interface AuthContextProps {
  login: (email: string, password: string) => void;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    cityId: number,
    photo: string | null
  ) => void;
  checkToken: () => void;
  logout: () => void;
  isLoading: boolean;
  auth: AuthState;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const initialState: AuthState = {
  id: null,
  checking: true,
  isLoggedIn: false,
  firstName: null,
  lastName: null,
  email: null,
  role: null,
};

interface AuthProviderProps {
  children: React.ReactNode;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(initialState);
  const { openNotification } = useNotification();
  const { post, isLoading } = useFetch<{
    token?: string;
    user?: AuthState;
  }>();

  const login = async (email: string, password: string) => {
    try {
      const data = await post("/auth/login", { email, password });
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAuth({
          ...data.user,
          checking: false,
          isLoggedIn: true,
          role: data.user.userType || null,
        });
        return data;
      } else {
        throw new Error("Respuesta de login inválida");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      openNotification(
        "error",
        "Error al iniciar sesión",
        "No se pudo iniciar sesión, verifica tus datos e intenta nuevamente!"
      );
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    cityId: number,
    photo: string | null = null
  ) => {
    try {
      const response = await post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        cityId,
        photo: photo || null,
      });
      if (response) {
        openNotification(
          "success",
          "Registro exitoso",
          "Ingresa a tu correo electrónico para validar tu cuenta!"
        );
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      openNotification(
        "error",
        "Error al registrar",
        "No se pudo completar el registro, intenta nuevamente!"
      );
      throw error;
    }
  };

  const checkToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuth({
        ...initialState,
        checking: false,
      });
      return;
    }
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth({
        ...initialState,
        checking: false,
      });
      openNotification(
        "warning",
        "Sesión expirada",
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
      );
      return;
    }

    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const userData = JSON.parse(userString);
        setAuth({
          ...userData,
          checking: false,
          isLoggedIn: true,
          role: userData.userType || null,
        });
      } else {
        throw new Error("No hay información de usuario disponible");
      }
    } catch (error) {
      console.error("Error al validar token localmente:", error);
      logout();
    }
  }, [openNotification]);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({
      ...initialState,
      checking: false,
    });
  };

  const contextValue: AuthContextProps = {
    login,
    register,
    checkToken,
    logout,
    isLoading,
    auth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
