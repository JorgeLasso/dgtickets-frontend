import { Ticket } from "../ticket/ticket.types";

export interface Module {
  id: number;
  name: string;
  isActive: boolean;
  headquarterId: number;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  user?: { firstName: string; lastName: string } | null;
  tickets?: Ticket[];
}

export interface ModulesResponse {
  page: number;
  limit: number;
  total: number;
  next: number | null;
  prev: number | null;
  modules: Module[];
}

export interface ModulesByHeadquarterResponse {
  module: Module[];
}
