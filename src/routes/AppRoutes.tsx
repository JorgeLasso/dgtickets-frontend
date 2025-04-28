import React, { useContext, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router";
import CreateTicket from "../pages/CreateTicket";
import AdviserPage from "../pages/AdviserPage";
import ModulePage from "../pages/ModulePage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmailValidated from "../pages/EmailValidated";
import ForgotPassword from "../pages/ForgotPassword";
import ChangePassword from "../pages/ChangePassword";
import MedicinesPage from "../pages/MedicinesPage";
import HomePage from "../pages/HomePage";
import { AuthContext } from "../auth/AuthContext";
import PublicRoutes from "./PublicRoutes";
import PrivateRoutes from "./PrivateRoutes";
import { ROLES } from "../constants/Roles";

const AppRoutes: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext debe ser usado dentro de un AuthProvider");
  }

  const { auth, checkToken } = authContext;

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  if (auth.checking) {
    return <div>Cargando...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/medicamentos" element={<MedicinesPage />} />

      {/* Unlogin Routes */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/auth/validate-email" element={<EmailValidated />} />
        <Route path="/recuperar-contraseña" element={<ForgotPassword />} />
        <Route path="/auth/recovery-password" element={<ChangePassword />} />
      </Route>

      {/* User Routes */}
      <Route element={<PrivateRoutes allowedRoles={[ROLES.USER]} />}>
        <Route path="/crear" element={<CreateTicket />} />
      </Route>

      {/* Adviser Routes */}
      <Route element={<PrivateRoutes allowedRoles={[ROLES.ADVISER]} />}>
        <Route path="/asesor/ingresar" element={<AdviserPage />} />
        <Route path="/asesor/modulo" element={<ModulePage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<PrivateRoutes allowedRoles={[ROLES.ADMIN]} />}></Route>

      {/* Admin and Adviser Routes */}
      <Route
        element={<PrivateRoutes allowedRoles={[ROLES.ADMIN, ROLES.ADVISER]} />}
      ></Route>

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
};

export default AppRoutes;
