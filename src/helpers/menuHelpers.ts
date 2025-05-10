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

    // Admin and Adviser Routes
    if (item.key === "/medicamentos") {
      return userRole === ROLES.ADMIN || userRole === ROLES.ADVISER;
    }

    if (item.key === "/modulos") {
      return userRole === ROLES.ADMIN || userRole === ROLES.ADVISER;
    }

    // Public Routes
    if (item.key === "/login" || item.key === "/registro") {
      return false;
    }

    return true;
  });
};
