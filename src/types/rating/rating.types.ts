export interface Rating {
  id?: number;
  value: number;
  description: string;
  ticketId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingResponse {
  rating: Rating;
}
