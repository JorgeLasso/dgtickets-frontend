import React from "react";
import { Route, Routes, Navigate } from "react-router";
import Tickets from "../pages/Tickets";
import CreateTicket from "../pages/CreateTicket";
import AdviserPage from "../pages/AdviserPage";
import ModulePage from "../pages/ModulePage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmailValidated from "../pages/EmailValidated";
import ForgotPassword from "../pages/ForgotPassword";
import ChangePassword from "../pages/ChangePassword";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/crear" element={<CreateTicket />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/asesor/ingresar" element={<AdviserPage />} />
      <Route path="/asesor/modulo" element={<ModulePage />} />
      <Route path="/auth/validate-email" element={<EmailValidated />} />
      <Route path="/recuperar-contraseña" element={<ForgotPassword />} />
      <Route path="/auth/recovery-password" element={<ChangePassword />} />
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
};

export default AppRoutes;
