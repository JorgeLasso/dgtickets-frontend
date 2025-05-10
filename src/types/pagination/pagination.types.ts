export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  next: string | null;
  prev: string | null;
  items: T[];
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  loadAll?: boolean;
}
