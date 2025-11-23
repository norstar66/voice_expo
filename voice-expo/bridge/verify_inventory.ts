import { io } from 'socket.io-client';

const socket = io('http://localhost:8787');

const TICKET_ID = '0fd3d6ea-438b-481c-a686-7207ed4f21de';
const ITEM_ID = '3c9bcb1d-9abc-436a-a696-5a79a45dc8d5';
const STATION_ID = 'SALAD';

socket.on('connect', () => {
  console.log('Connected');
  
  // Subscribe to inventory
  socket.emit('INVENTORY_SUBSCRIBE');

  // Complete item
  console.log('Completing item...');
  socket.emit('TICKET_ITEM_DONE', { ticketId: TICKET_ID, itemId: ITEM_ID, stationId: STATION_ID });
});

socket.on('INVENTORY_UPDATE', (inventory) => {
  console.log('Inventory Update Received:');
  const feta = inventory.find((i: any) => i.ingredientId === 'whip_feta');
  if (feta) {
    console.log(`Whipped Feta - Sold: ${feta.sold}, Waste: ${feta.waste}, Prepped: ${feta.prepped}`);
  }
  socket.close();
});
