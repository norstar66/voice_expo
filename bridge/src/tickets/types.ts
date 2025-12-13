import { StationId } from '../stations/types';
export { StationId };

export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';
export type ItemStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';

export interface TicketItem {
  id: string;
  name: string;
  stations: StationId[];
  status: ItemStatus;
  course?: 'appetizer' | 'main' | 'desert';
  holdStatus?: 'HOLD' | 'FIRED';
  firedAt?: number;
  startedAt?: number;
  completedAt?: number;
  completedBy?: StationId;
  duration?: number; // in seconds
}

export interface Ticket {
  id: string;
  tableNumber: string;
  timestamp: number;
  items: TicketItem[];
  status: TicketStatus;
}
