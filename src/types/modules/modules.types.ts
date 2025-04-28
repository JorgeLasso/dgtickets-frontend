export interface Module {
  id: number;
  name: string;
  isActive: boolean;
  headquarterId: number;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  user?: { firstName: string; lastName: string } | null;
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
