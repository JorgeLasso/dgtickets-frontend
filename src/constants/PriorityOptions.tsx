import React from "react";
import {
  UserOutlined,
  WomanOutlined,
  HeartOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { PriorityOption } from "../types/ticket/ticket.types";

export const priorityOptions: PriorityOption[] = [
  {
    value: "regular",
    label: "Regular",
    icon: <UserOutlined />,
    description: "Turno normal",
  },
  {
    value: "elderly",
    label: "Adulto Mayor",
    icon: <AimOutlined />,
    description: "Mayor de 60 años",
  },
  {
    value: "pregnant",
    label: "Embarazada",
    icon: <WomanOutlined />,
    description: "Mujeres en estado de embarazo",
  },
  {
    value: "disability",
    label: "Discapacidad",
    icon: <HeartOutlined />,
    description: "Personas con discapacidad",
  },
];

export default priorityOptions;
