import { Link } from "react-router";

export const items = [
  {
    key: "/",
    label: <Link to="/">Inicio</Link>,
  },
  {
    key: "/medicamentos",
    label: <Link to="/medicamentos">Medicamentos</Link>,
  },
  {
    key: "/crear",
    label: <Link to="/crear">Solicitar turno</Link>,
  },
  {
    key: "/mis-tickets",
    label: <Link to="/mis-tickets">Mis Tickets</Link>,
  },
  {
    key: "/asesor",
    label: <Link to="/asesor">Asesor</Link>,
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
