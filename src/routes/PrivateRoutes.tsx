import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../auth/AuthContext";

interface PrivateRoutesProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({
  allowedRoles = [],
  redirectPath = "/login",
}) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext debe ser usado dentro de un AuthProvider");
  }

  const { auth } = authContext;

  if (!auth.isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  if (auth.role && allowedRoles.includes(auth.role)) {
    return <Outlet />;
  } else {
    return <Navigate to="/tickets" replace />;
  }
};

export default PrivateRoutes;
