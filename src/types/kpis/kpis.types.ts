import { Ticket } from "../ticket/ticket.types";

export interface TicketDistributionProps {
  completedTickets: Ticket[];
  isLoading: boolean;
}

export interface WaitTimeChartProps {
  priorityWaitTime: number;
  normalWaitTime: number;
  completionTime: number;
  isLoading: boolean;
}

export interface MedicineChartProps {
  medicineData: Array<{ medicine: { name: string }; quantity: number }>;
  isLoading: boolean;
}

export interface WaitTimeData {
  type: string;
  value: number;
}

export interface PendingTicketsData {
  tickets: Ticket[];
  isLoading: boolean;
  error: unknown;
  count?: number;
  avgPending?: number;
  avgProcessing?: number;
}

export interface KPIsChartsProps {
  priorityTicketsData: PendingTicketsData;
  normalTicketsData: PendingTicketsData;
  inProgressTickets: Ticket[];
  completedTickets: Ticket[];
  ticketMedicines?: Array<{ name: string; quantity: number }>;
  isMedicinesLoading?: boolean;
  isLoading: boolean;
  ratings?: number[];
  ticketTypeData?: { type: string; count: number }[];
}

export interface KPIsExport {
  totalPendingTickets: number;
  totalInProgressTickets: number;
  totalCompletedTickets: number;
  medicinesWithLowStock: number;
  totalMedicineQuantity: number;
  avgPriorityWaitTime: number;
  avgNormalWaitTime: number;
  avgCompletionTime: number;
  medicinesDeliveredCount: number;
}
