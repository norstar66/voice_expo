import { StationId } from '../stations/types';
import { Ticket } from '../tickets/types';
import { InventoryState, InventoryAction, InventoryView, IngredientType } from '../inventory/types';

export interface ServerToClientEvents {
  'TICKET_NEW': (ticket: Ticket) => void;
  'TICKET_UPDATED': (ticket: Ticket) => void;
  'INITIAL_STATE': (tickets: Ticket[]) => void;
  INVENTORY_UPDATE: (inventory: InventoryView[]) => void;
}

export interface ClientToServerEvents {
  'REGISTER_STATION': (data: { stationId: string }) => void; // Keep registration loose or make strict? Strict is better but string is fine for now as it comes from UI
  'TICKET_ITEM_START': (data: { ticketId: string; itemId: string; stationId: StationId }) => void;
  'TICKET_ITEM_DONE': (data: { ticketId: string; itemId: string; stationId: StationId }) => void;
  'TICKET_COMPLETED': (data: { ticketId: string; stationId: StationId }) => void;
  'TICKET_FIRE_COURSE': (data: { ticketId: string; course: 'appetizer' | 'main' | 'desert'; stationId: StationId }) => void;
  INVENTORY_SUBSCRIBE: () => void;
  INVENTORY_ACTION: (action: InventoryAction) => void;
  INVENTORY_ADD_ITEM: (item: { name: string; unit: string; type: IngredientType }) => void;
}
