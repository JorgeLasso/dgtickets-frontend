export interface City {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  stateId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CityPagination {
  page: number;
  limit: number;
  total: number;
  next: number | null;
  prev: number | null;
  cities: City[];
}

export interface CityFormValues {
  name: string;
  image: string;
  isActive: boolean;
  stateId: number;
}
