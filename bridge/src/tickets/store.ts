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
    if (stationId === 'EXPO' || stationId === 'SERVER') {
       // Expo and Server see everything including history
      return this.getAllTickets();
    }
    
    // Stations see all ACTIVE tickets (not DONE) so they can show ghost tickets
    // + any tickets that are DONE but contain items for this station (History for this station)
    return this.getAllTickets().filter(ticket => {
      // If ticket is active, show it (Ghost tickets logic)
      if (ticket.status !== 'DONE') return true;

      // If ticket is DONE, only show if it had items for this station
      return ticket.items.some(item => item.stations.includes(stationId));
    });
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

  fireCourse(ticketId: string, course: 'appetizer' | 'main' | 'desert'): Ticket | undefined {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;

    const now = Date.now();
    let updated = false;

    ticket.items.forEach(item => {
      if (item.course === course && item.holdStatus === 'HOLD') {
        item.holdStatus = 'FIRED';
        item.firedAt = now;
        updated = true;
      }
    });
    
    // Also record when previous courses were sent if needed? 
    // Implementation Plan said: "When the Entre fires, the ticket comes back showing that the appitizer was sent and when."
    // This implies we store "sentAt" on the course? Or just use the firedAt of the next course as a proxy?
    // Actually, items are 'Sent' when they are DONE? Or 'Sent to kitchen'?
    // 'Fired' usually means 'Start cooking'. 
    
    return updated ? ticket : undefined;
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
