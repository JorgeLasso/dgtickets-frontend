import { Link } from "react-router";

export const items = [
  {
    key: "/",
    label: <Link to="/">Inicio</Link>,
  },
  {
    key: "/medicamentos",
    label: <Link to="/medicamentos">Gestionar Medicamentos</Link>,
  },
  {
    key: "/medicamentos-sede",
    label: <Link to="/medicamentos-sede">Ver Medicamentos</Link>,
  },
  {
    key: "/modulos",
    label: <Link to="/modulos">Gestionar Modulos</Link>,
  },
  {
    key: "/pqrs",
    label: <Link to="/pqrs">PQRs</Link>,
  },
  {
    key: "/sedes",
    label: <Link to="/sedes">Gestionar Sedes</Link>,
  },
  {
    key: "/usuarios",
    label: <Link to="/usuarios">Gestionar Usuarios</Link>,
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
