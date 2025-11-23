import { io } from 'socket.io-client';

const socket = io('http://localhost:8787');

socket.on('connect', () => {
  console.log('Connected');
  
  // Subscribe to inventory
  socket.emit('INVENTORY_SUBSCRIBE');

  // Add new item
  console.log('Adding new item...');
  socket.emit('INVENTORY_ADD_ITEM', { name: 'Test Basil', unit: 'bunch', type: 'ORDER' });
});

socket.on('INVENTORY_UPDATE', (inventory) => {
  console.log('Inventory Update Received:');
  const basil = inventory.find((i: any) => i.name === 'Test Basil');
  if (basil) {
    console.log(`Found New Item: ${basil.name} (${basil.unit}) - Type: ${basil.type}`);
    socket.close();
  }
});
