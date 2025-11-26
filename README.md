# Voice Expo Prototype

A real-time kitchen display system prototype with a central Bridge and Station UIs.

## Structure

- `bridge/`: Node.js + Express + Socket.IO backend.
- `station-ui/`: React + Vite frontend.

## Getting Started

### 1. Start the Bridge (Backend)

```bash
cd bridge
npm install
npm run dev
```

The server will start on port 8080. It includes a mock ticket generator that creates a new ticket every 10 seconds.

### 2. Start the Station UI (Frontend)

```bash
cd station-ui
npm install
npm run dev
```

The frontend will start on port 5173.

### 3. Open Station Views

Open your browser to the following URLs to simulate different stations:

- **Grill/Saute1**: [http://localhost:5173/?stationId=GRILL/SAUTE1](http://localhost:5173/?stationId=GRILL/SAUTE1)
- **Saute2**: [http://localhost:5173/?stationId=SAUTE2](http://localhost:5173/?stationId=SAUTE2)
- **Fry**: [http://localhost:5173/?stationId=FRY](http://localhost:5173/?stationId=FRY)
- **Pizza**: [http://localhost:5173/?stationId=PIZZA](http://localhost:5173/?stationId=PIZZA)
- **Salad**: [http://localhost:5173/?stationId=SALAD](http://localhost:5173/?stationId=SALAD)
- **Expo (Manager)**: [http://localhost:5173/?stationId=EXPO](http://localhost:5173/?stationId=EXPO)

## Features

- **Real-time Ticket Updates**: Tickets appear instantly on relevant stations.
- **Station Filtering**: Each station only sees items assigned to it.
- **Completed Orders View**: Switch between "Active Orders" and "Completed History" tabs.
- **Mock Ticket Generator**: Simulate a busy kitchen with auto-generated orders.

## Controlling the Mock Generator

The mock generator is disabled by default. You can control it using the following commands:

**Start the feed (generates a ticket every 10s):**

```bash
curl -X POST http://localhost:8787/mock/start
```

**Stop the feed:**

```bash
curl -X POST http://localhost:8787/mock/stop
```

**Inject a single random ticket:**

```bash
curl -X POST http://localhost:8787/mock/ticket
```

## How it Works

1. The **Bridge** generates a mock ticket (or receives one via API).
2. It broadcasts `TICKET_NEW` to relevant stations via WebSockets.
3. **Station UI** receives the event and adds the ticket to the list.
4. When a cook clicks "Done", the UI sends `TICKET_ITEM_DONE`.
5. When all items on a ticket are done, it moves to the "Completed History" tab.
6. The **Bridge** updates the state and notifies everyone (including Expo).

## Moving to Raspberry Pi + Tablets

1. **Bridge**:

   - Copy the `bridge` folder to the Pi.
   - Run `npm install && npm run build && npm start`.
   - Ensure the Pi has a static IP (e.g., `192.168.1.50`).

2. **Station UI**:
   - In `station-ui/src/App.tsx`, change `BRIDGE_URL` to the Pi's IP: `http://192.168.1.50:8080`.
   - You can serve the UI from the Pi as well (build it and serve `dist` folder via Nginx or the Bridge's Express app), or run it on a separate server.
   - On Android tablets, just open Chrome/Kiosk Browser to the UI URL.
