import { Link } from "react-router";

export const items = [
  {
    key: "/tickets",
    label: <Link to="/tickets">Tickets</Link>,
  },
  {
    key: "/crear",
    label: <Link to="/crear">Crear Ticket</Link>,
  },
  {
    key: "/asesor/ingresar",
    label: <Link to="/asesor/ingresar">Asesor</Link>,
  },
];
