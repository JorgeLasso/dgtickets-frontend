export interface PQR {
  id: number;
  pqrType: "COMPLETED" | "PENDING";
  description: string;
  answer: string | null;
  answerByUser: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PQRResponse {
  page: number;
  limit: number;
  total: number;
  next: number | null;
  prev: number | null;
  pqrs: PQR[];
}

export interface PQRFormValues {
  description: string;
}

export interface PQRAnswerFormValues {
  answer: string;
}
