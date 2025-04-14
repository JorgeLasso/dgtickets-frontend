import { Link } from "react-router";

export const items = [
  {
    key: "/tickets",
    label: <Link to="/tickets">Tickets</Link>,
  },
  {
    key: "/medicamentos",
    label: <Link to="/medicamentos">Medicamentos</Link>,
  },
  {
    key: "/crear",
    label: <Link to="/crear">Crear Ticket</Link>,
  },
  {
    key: "/asesor/ingresar",
    label: <Link to="/asesor/ingresar">Asesor</Link>,
  },
  {
    key: "/login",
    label: <Link to="/login">Ingresar</Link>,
  },
  {
    key: "/registro",
    label: <Link to="/registro">Registro</Link>,
  },
];
