export interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  done: boolean;
}

export interface WorkingTicket {
  number: number;
  handleAtModule: string;
}