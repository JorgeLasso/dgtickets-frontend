export interface Country {
  id: number;
  name: string;
  available: string;
}

export interface CountryPagination {
  page: number;
  limit: number;
  total: number;
  next: number | null;
  prev: number | null;
  countries: Country[];
}

export interface CountryFormValues {
  name: string;
  available: string;
}

export interface State {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  countryId: number;
  createdAt?: string;
  updatedAt?: string;
  country?: {
    name: string;
  };
}

export interface StatePagination {
  page: number;
  limit: number;
  total: number;
  next: number | null;
  prev: number | null;
  states: State[];
}

export interface StateFormValues {
  name: string;
  image: string;
  isActive: boolean;
  countryId: number;
}

export interface City {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  stateId: number;
  createdAt?: string;
  updatedAt?: string;
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
