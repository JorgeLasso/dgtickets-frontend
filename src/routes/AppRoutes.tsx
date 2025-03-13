import React from "react";
import { Route, Routes, Navigate } from "react-router";
import Tickets from "../pages/Tickets";
import CreateTicket from "../pages/CreateTicket";
import AdviserPage from "../pages/AdviserPage";
import ModulePage from "../pages/ModulePage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/crear" element={<CreateTicket />} />
      <Route path="/asesor/ingresar" element={<AdviserPage />} />
      <Route path="/asesor/modulo" element={<ModulePage />} />
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
};

export default AppRoutes;
