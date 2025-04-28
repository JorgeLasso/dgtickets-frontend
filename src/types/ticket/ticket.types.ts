export interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  done: boolean;
}

export interface Ticket_ {
  id: string;
  code: string;
  userId: string;
  headquarterId: number;
  priority: boolean;
  moduleId: number;
  orderDate: Date;
  serviceDate: Date;
  ticketType: string;
}

export interface WorkingTicket {
  id: number;
  ticketType: string;
  priority: boolean;
  pendingTimeInSeconds: number | null;
  processingTimeInSeconds: number | null;
  headquarterId: number;
  userId: number;
  moduleId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsResponse {
  tickets: WorkingTicket[];
  countPendingTickets: number;
  averagePendingTimeToAttendInSecond: number;
  averageProcessingTimeModuleInSecod: number;
}
