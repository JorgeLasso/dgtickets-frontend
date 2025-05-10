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
