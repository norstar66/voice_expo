import { Ticket } from '../tickets/types';
import { StationId } from '../stations/types';

export interface ServerToClientEvents {
  'TICKET_NEW': (ticket: Ticket) => void;
  'TICKET_UPDATED': (ticket: Ticket) => void;
  'INITIAL_STATE': (tickets: Ticket[]) => void;
}

export interface ClientToServerEvents {
  'REGISTER_STATION': (data: { stationId: StationId }) => void;
  'TICKET_ITEM_START': (data: { ticketId: string; itemId: string; stationId: StationId }) => void;
  'TICKET_ITEM_DONE': (data: { ticketId: string; itemId: string; stationId: StationId }) => void;
  'TICKET_COMPLETED': (data: { ticketId: string; stationId: StationId }) => void;
}
