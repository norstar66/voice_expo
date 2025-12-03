import { io } from 'socket.io-client';

const socket = io('http://localhost:8787');

socket.on('connect', () => {
  console.log('Connected');
  
  // Subscribe to inventory
  socket.emit('INVENTORY_SUBSCRIBE');

  // Add new item
  console.log('Adding Par Item...');
  socket.emit('INVENTORY_ADD_ITEM', { name: 'Par Item', unit: 'units', type: 'PREP' });
});

socket.on('INVENTORY_UPDATE', (inventory) => {
  const item = inventory.find((i: any) => i.name === 'Par Item');
  if (!item) return;

  console.log(`Item State: Par=${item.parLevel}, Current=${item.currentCount}, Needed=${Math.max(0, (item.parLevel || 0) - (item.currentCount || 0))}`);

  if (!item.parLevel) {
    console.log('Setting Par Level to 10...');
    socket.emit('INVENTORY_UPDATE_ITEM', { ingredientId: item.ingredientId, updates: { parLevel: 10 } });
  } else if (item.parLevel === 10 && !item.currentCount) {
    console.log('Setting Current Count to 4...');
    socket.emit('INVENTORY_UPDATE_ITEM', { ingredientId: item.ingredientId, updates: { currentCount: 4 } });
  } else if (item.parLevel === 10 && item.currentCount === 4) {
    console.log('Verification Complete: Needed should be 6');
    socket.close();
  }
});
