import { ReactNode } from "react";

export interface ItemProperty {
  label: string;
  value: string | number | ReactNode;
}

export interface CardData {
  loading?: boolean;
  title: string;
  image?: string;
  properties?: ItemProperty[];
  actions?: ReactNode[];
}