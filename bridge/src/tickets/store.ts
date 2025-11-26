import { Ticket, StationId } from './types';

class TicketStore {
  private tickets: Map<string, Ticket> = new Map();

  addTicket(ticket: Ticket): void {
    this.tickets.set(ticket.id, ticket);
  }

  getTicket(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  getAllTickets(): Ticket[] {
    return Array.from(this.tickets.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  getTicketsForStation(stationId: StationId): Ticket[] {
    if (stationId === 'EXPO') {
      return this.getAllTickets();
    }
    return this.getAllTickets().filter(ticket => 
      ticket.items.some(item => item.stations.includes(stationId))
    );
  }

  updateItemStatus(ticketId: string, itemId: string, status: 'DONE', stationId?: StationId): Ticket | undefined {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;

    const item = ticket.items.find(i => i.id === itemId);
    if (item) {
      item.status = status;
      item.completedAt = Date.now();
      if (stationId) item.completedBy = stationId;
      
      if (item.startedAt) {
        item.duration = Math.floor((item.completedAt - item.startedAt) / 1000);
      }
    }

    // Check if all items are done
    const allDone = ticket.items.every(i => i.status === 'DONE');
    if (allDone) {
      ticket.status = 'DONE';
    } else {
        if (ticket.status === 'NEW') ticket.status = 'IN_PROGRESS';
    }

    return ticket;
  }

  startItem(ticketId: string, itemId: string): Ticket | undefined {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;

    const item = ticket.items.find(i => i.id === itemId);
    if (item && item.status === 'NEW') {
      item.status = 'IN_PROGRESS';
      item.startedAt = Date.now();
      if (ticket.status === 'NEW') ticket.status = 'IN_PROGRESS';
    }

    return ticket;
  }

  completeTicket(ticketId: string): Ticket | undefined {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;

    ticket.items.forEach(item => {
      item.status = 'DONE';
    });
    ticket.status = 'DONE';

    return ticket;
  }
}

export const store = new TicketStore();
