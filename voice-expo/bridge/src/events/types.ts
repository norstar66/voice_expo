import { Ticket } from '../tickets/types';
import { InventoryState, InventoryAction, InventoryView, IngredientType } from '../inventory/types';

export interface ServerToClientEvents {
  'TICKET_NEW': (ticket: Ticket) => void;
  'TICKET_UPDATED': (ticket: Ticket) => void;
  'INITIAL_STATE': (tickets: Ticket[]) => void;
  INVENTORY_UPDATE: (inventory: InventoryView[]) => void;
}

export interface ClientToServerEvents {
  'REGISTER_STATION': (data: { stationId: string }) => void;
  'TICKET_ITEM_START': (data: { ticketId: string; itemId: string; stationId: string }) => void;
  'TICKET_ITEM_DONE': (data: { ticketId: string; itemId: string; stationId: string }) => void;
  'TICKET_COMPLETED': (data: { ticketId: string; stationId: string }) => void;
  INVENTORY_SUBSCRIBE: () => void;
  INVENTORY_ACTION: (action: InventoryAction) => void;
  INVENTORY_ADD_ITEM: (item: { name: string; unit: string; type: IngredientType }) => void;
}
