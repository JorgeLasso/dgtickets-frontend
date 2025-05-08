export interface Ticket {
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
  user: {
    firstName: string;
    lastName: string;
  };
  ticketMedicines?: Array<{
    quantity: number;
    medicine: {
      name: string;
    };
  }>;
}

export interface TicketsResponse {
  tickets: Ticket[];
  countPendingTickets: number;
  averagePendingTimeToAttendInSecond: number;
  averageProcessingTimeModuleInSecod: number;
}

export interface PositionData {
  position: number;
  estimatedTimeAtentionInSeconds: number;
}
