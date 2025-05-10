import { AuthState } from "../types/auth/auth.types";
import { ROLES } from "../constants/Roles";
import { items } from "../constants/MenuItems";

export const getFilteredMenuItems = (auth: AuthState | null) => {
  return items.filter((item) => {
    // Public Home
    if (item.key === "/") {
      return true;
    }

    // Public Routes
    if (item.key === "/medicamentos-sede") {
      return true;
    }

    if (!auth || !auth.isLoggedIn) {
      return item.key === "/login" || item.key === "/registro";
    }

    const userRole = auth.role;

    // User Routes
    if (item.key === "/crear" || item.key === "/mis-tickets") {
      return userRole === ROLES.USER;
    }

    // Adviser Routes
    if (item.key === "/asesor") {
      return userRole === ROLES.ADVISER;
    }

    // Admin Routes
    if (item.key === "/sedes") {
      return userRole === ROLES.ADMIN;
    }

    if (item.key === "/usuarios") {
      return userRole === ROLES.ADMIN;
    }

    // Admin and Adviser Routes
    if (item.key === "/medicamentos") {
      return userRole === ROLES.ADMIN || userRole === ROLES.ADVISER;
    }

    if (item.key === "/modulos") {
      return userRole === ROLES.ADMIN || userRole === ROLES.ADVISER;
    }

    // Admin, Adviser and User Routes
    if (item.key === "/pqrs") {
      return (
        userRole === ROLES.ADMIN ||
        userRole === ROLES.ADVISER ||
        userRole === ROLES.USER
      );
    }

    // Public Routes
    if (item.key === "/login" || item.key === "/registro") {
      return false;
    }

    return true;
  });
};
