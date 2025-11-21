import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config';
import { ClientToServerEvents, ServerToClientEvents } from './events/types';
import { StationId } from './stations/types';
import { store } from './tickets/store';
import { MockGenerator } from './mock-generator';

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"]
  }
});

const mockGen = new MockGenerator(io);

// --- API Endpoints ---

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/tickets', (req, res) => {
  res.json(store.getAllTickets());
});

app.post('/mock/ticket', (req, res) => {
  const ticket = mockGen.createRandomTicket();
  store.addTicket(ticket);
  
  // Broadcast
  io.to('EXPO').emit('TICKET_NEW', ticket);
  const relevantStations = new Set<StationId>();
  ticket.items.forEach(item => item.stations.forEach(s => relevantStations.add(s)));
  relevantStations.forEach(s => io.to(s).emit('TICKET_NEW', ticket));

  res.json(ticket);
});

// --- WebSocket Handling ---

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('REGISTER_STATION', ({ stationId }) => {
    console.log(`Socket ${socket.id} registered as ${stationId}`);
    socket.join(stationId);
    
    // Send initial state
    const tickets = store.getTicketsForStation(stationId);
    socket.emit('INITIAL_STATE', tickets);
  });

  socket.on('TICKET_ITEM_START', ({ ticketId, itemId, stationId }) => {
    console.log(`[${stationId}] Started item ${itemId} in ticket ${ticketId}`);
    const updatedTicket = store.startItem(ticketId, itemId);
    
    if (updatedTicket) {
      // Broadcast update to EXPO and relevant stations
      io.to('EXPO').emit('TICKET_UPDATED', updatedTicket);
      
      const relevantStations = new Set<StationId>();
      updatedTicket.items.forEach(item => item.stations.forEach(s => relevantStations.add(s)));
      relevantStations.forEach(s => io.to(s).emit('TICKET_UPDATED', updatedTicket));
    }
  });

  socket.on('TICKET_ITEM_DONE', ({ ticketId, itemId, stationId }) => {
    console.log(`[${stationId}] Marked item ${itemId} in ticket ${ticketId} as DONE`);
    const updatedTicket = store.updateItemStatus(ticketId, itemId, 'DONE', stationId);
    
    if (updatedTicket) {
      // Broadcast update to EXPO and relevant stations
      io.to('EXPO').emit('TICKET_UPDATED', updatedTicket);
      
      const relevantStations = new Set<StationId>();
      updatedTicket.items.forEach(item => item.stations.forEach(s => relevantStations.add(s)));
      relevantStations.forEach(s => io.to(s).emit('TICKET_UPDATED', updatedTicket));
    }
  });

  socket.on('TICKET_COMPLETED', ({ ticketId, stationId }) => {
    console.log(`[${stationId}] Marked ticket ${ticketId} as COMPLETED`);
    const updatedTicket = store.completeTicket(ticketId);

    if (updatedTicket) {
      // Broadcast update to EXPO and relevant stations
      io.to('EXPO').emit('TICKET_UPDATED', updatedTicket);
      
      const relevantStations = new Set<StationId>();
      updatedTicket.items.forEach(item => item.stations.forEach(s => relevantStations.add(s)));
      relevantStations.forEach(s => io.to(s).emit('TICKET_UPDATED', updatedTicket));
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- Start Server ---

server.listen(config.port, () => {
  console.log(`Bridge server listening on port ${config.port}`);
  
  // Start mock feed automatically for this prototype
  // mockGen.start(10000); // Every 10 seconds
});

app.post('/mock/start', (req, res) => {
  mockGen.start(10000);
  res.json({ status: 'Mock generator started' });
});

app.post('/mock/stop', (req, res) => {
  mockGen.stop();
  res.json({ status: 'Mock generator stopped' });
});
