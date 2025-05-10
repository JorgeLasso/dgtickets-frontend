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
  rating?: {
    id?: number;
    value: number;
    description: string;
    ticketId: number;
    createdAt?: string;
    updatedAt?: string;
  };
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

export type PriorityType = "regular" | "elderly" | "pregnant" | "disability";

export interface PriorityOption {
  value: PriorityType;
  label: string;
  icon: React.ReactNode;
  description: string;
}
