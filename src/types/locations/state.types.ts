export interface State {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  countryId: number;
  createdAt: string;
  updatedAt: string;
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
