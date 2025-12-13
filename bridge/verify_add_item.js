"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)('http://localhost:8787');
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
    const basil = inventory.find((i) => i.name === 'Test Basil');
    if (basil) {
        console.log(`Found New Item: ${basil.name} (${basil.unit}) - Type: ${basil.type}`);
        socket.close();
    }
});
