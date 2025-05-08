import React, { useContext, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router";
import CreateTicket from "../pages/CreateTicket";
import AdviserPage from "../pages/AdviserPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmailValidated from "../pages/EmailValidated";
import ForgotPassword from "../pages/ForgotPassword";
import ChangePassword from "../pages/ChangePassword";
import MedicinesPage from "../pages/MedicinesPage";
import HomePage from "../pages/HomePage";
import TicketDetailsPage from "../pages/TicketDetailsPage";
import TicketHistoryPage from "../pages/TicketHistoryPage";
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
        <Route path="/ticket/:ticketId" element={<TicketDetailsPage />} />
        <Route path="/mis-tickets" element={<TicketHistoryPage />} />
      </Route>

      {/* Adviser Routes */}
      <Route element={<PrivateRoutes allowedRoles={[ROLES.ADVISER]} />}>
        <Route path="/asesor" element={<AdviserPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<PrivateRoutes allowedRoles={[ROLES.ADMIN]} />}></Route>

      {/* Admin and Adviser Routes */}
      <Route
        element={<PrivateRoutes allowedRoles={[ROLES.ADMIN, ROLES.ADVISER]} />}
      ></Route>

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
