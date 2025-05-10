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
  photo: string | null;
  userType: string;
  email: string;
  emailValidated: boolean;
  password?: string;
  isActive: boolean;
  cityId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  users: User[];
  page: number;
  limit: number;
  total: number;
  next: string | null;
  prev: string | null;
}
