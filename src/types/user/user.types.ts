export interface AdviserFormValues {
  userName: string;
  module: string;
}

export interface City {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  stateId: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  userType: string;
  isActive: boolean;
  cityId: number;
}

export interface UsersResponse {
  users: User[];
  page: number;
  limit: number;
  total: number;
  next: number | null;
  prev: number | null;
}
