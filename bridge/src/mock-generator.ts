import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import { Ticket, TicketItem } from './tickets/types';
import { StationId } from './stations/types';
import { store } from './tickets/store';

import { MENU_ITEMS } from './data/menu';

// Removed hardcoded MENU_ITEMS in favor of imported data


export class MockGenerator {
  private io: Server;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
  }

  start(intervalMs: number = 15000) {
    if (this.intervalId) return;
    console.log(`[MockGenerator] Starting mock feed every ${intervalMs}ms`);
    
    this.intervalId = setInterval(() => {
      this.generateAndEmit();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  generateAndEmit() {
    const ticket = this.createRandomTicket();
    store.addTicket(ticket);
    
    console.log(`[MockGenerator] Created Ticket #${ticket.id.slice(0, 4)} for Table ${ticket.tableNumber}`);
    
    this.io.to('EXPO').emit('TICKET_NEW', ticket);
    
    const relevantStations = new Set<StationId>();
    ticket.items.forEach(item => {
      item.stations.forEach(s => relevantStations.add(s));
    });

    relevantStations.forEach(stationId => {
      this.io.to(stationId).emit('TICKET_NEW', ticket);
    });
  }

  createRandomTicket(): Ticket {
    const id = uuidv4();
    const tableNumber = Math.floor(Math.random() * 20 + 1).toString();
    const numItems = Math.floor(Math.random() * 3) + 1;
    
    const items: TicketItem[] = [];
    for (let i = 0; i < numItems; i++) {
      const menuIdx = Math.floor(Math.random() * MENU_ITEMS.length);
      const menuItem = MENU_ITEMS[menuIdx];
      items.push({
        id: uuidv4(),
        name: menuItem.name,
        stations: menuItem.stations,
        status: 'NEW'
      });
    }

    return {
      id,
      tableNumber,
      timestamp: Date.now(),
      items,
      status: 'NEW'
    };
  }
}
