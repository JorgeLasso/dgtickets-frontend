import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../auth/AuthContext";

interface PublicRoutesProps {
  redirectPath?: string;
}

const PublicRoutes: React.FC<PublicRoutesProps> = ({
  redirectPath = "/tickets",
}) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext debe ser usado dentro de un AuthProvider");
  }

  const { auth } = authContext;

  return auth.isLoggedIn ? <Navigate to={redirectPath} replace /> : <Outlet />;
};

export default PublicRoutes;
