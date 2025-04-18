import { AuthState } from "../types/auth/auth.types";
import { ROLES } from "../constants/Roles";
import { items } from "../constants/MenuItems";

export const getFilteredMenuItems = (auth: AuthState | null) => {
  return items.filter((item) => {
    // Public Routes
    if (item.key === "/tickets") {
      return true;
    }

    if (item.key === "/medicamentos") {
      return true;
    }
    
    if (!auth || !auth.isLoggedIn) {
      return item.key === "/login" || item.key === "/registro";
    }
    
    const userRole = auth.role;

    // User Routes
    if (item.key === "/crear") {
      return userRole === ROLES.USER;
    }

    // Adviser Routes
    if (item.key === "/asesor/ingresar") {
      return userRole === ROLES.ADVISER;
    }

    // Admin Routes

    // Admin and Adviser Routes

    // Public Routes
    if (item.key === "/login" || item.key === "/registro") {
      return false;
    }

    return true;
  });
};