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

Open your browser to [http://localhost:5173](http://localhost:5173).

The application now uses a unified interface with tabs for navigation:

- **Station Tabs**: Click the tabs (e.g., GRILL/SAUTE1, PIZZA, EXPO) to switch between different station views.
- **HISTORY**: View completed orders and ticket history.
- **PREP & ORDER**: Manage inventory, track waste, and view prep/order lists.

## Features

- **Unified Tabbed Interface**: Easily switch between Stations, History, and Prep/Order views.
- **Real-time Ticket Updates**: Tickets appear instantly on relevant stations.
- **Station Filtering**: Each station only sees items assigned to it.
- **History View**: Review completed orders and performance metrics.
- **Inventory Management**: Track stock, record waste, and manage prep lists in real-time.
- **Mock Ticket Generator**: Simulate a busy kitchen with auto-generated orders.

## Controlling the Mock Generator

The mock generator is disabled by default. You can control it using the following commands:

**Start the feed (generates a ticket every 10s):**

```bash
curl -X POST http://localhost:8080/mock/start
```

**Stop the feed:**

```bash
curl -X POST http://localhost:8080/mock/stop
```

**Inject a single random ticket:**

```bash
curl -X POST http://localhost:8080/mock/ticket
```

## Alexa Integration

The Bridge includes an endpoint `/alexa` that serves as a fulfillment URL for an Alexa Skill.

**Supported Intents:**

- `GetInventoryIntent`: Checks the current inventory status.
- `AddItemIntent`: Adds items to the prep list (e.g., "Add 5 tomatoes").

## Inventory System

The system tracks inventory for items.

- **Sales**: When a ticket item is marked "DONE", the corresponding inventory count is decremented.
- **Prep**: Items can be added via Alexa or other inputs to increase the "prepped" count.
- **Real-time Updates**: Inventory changes are broadcast to connected clients via `INVENTORY_UPDATE` events.

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
