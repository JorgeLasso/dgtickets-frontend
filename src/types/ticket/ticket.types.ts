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
  number: number;
  handleAtModule: string;
}
