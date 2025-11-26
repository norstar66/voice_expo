import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

// Types (mirrored from backend)
interface InventoryView {
  ingredientId: string;
  name: string;
  type: 'PREP' | 'ORDER';
  unit: string;
  sold: number;
  waste: number;
  prepped: number;
}

interface Props {
  socket: Socket | null;
}

export function PrepOrderView({ socket }: Props) {
  const [activeTab, setActiveTab] = useState<'PREP' | 'ORDER'>('PREP');
  const [inventory, setInventory] = useState<InventoryView[]>([]);
  const [wasteInputs, setWasteInputs] = useState<Record<string, string>>({});
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.emit('INVENTORY_SUBSCRIBE');

    socket.on('INVENTORY_UPDATE', (data: InventoryView[]) => {
      setInventory(data);
    });

    return () => {
      socket.off('INVENTORY_UPDATE');
    };
  }, [socket]);

  const handleAction = (ingredientId: string, type: 'PREP' | 'ORDER') => {
    if (!socket) return;
    
    const state = inventory.find(i => i.ingredientId === ingredientId);
    if (!state) return;

    const needed = (state.sold + state.waste) - state.prepped;
    if (needed <= 0) return;

    socket.emit('INVENTORY_ACTION', {
      ingredientId,
      amount: needed,
      type
    });
  };

  const handleWaste = (ingredientId: string) => {
    if (!socket) return;
    const amount = parseFloat(wasteInputs[ingredientId]);
    if (isNaN(amount) || amount <= 0) return;

    socket.emit('INVENTORY_ACTION', {
      ingredientId,
      amount,
      type: 'WASTE'
    });

    setWasteInputs(prev => ({ ...prev, [ingredientId]: '' }));
  };

  const handleAddItem = () => {
    if (!socket || !newItemName || !newItemUnit) return;

    socket.emit('INVENTORY_ADD_ITEM', {
      name: newItemName,
      unit: newItemUnit,
      type: activeTab
    });

    setNewItemName('');
    setNewItemUnit('');
  };

  const filteredIngredients = inventory.filter(i => i.type === activeTab);

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('PREP')}
            style={{
              backgroundColor: activeTab === 'PREP' ? 'var(--color-accent)' : 'var(--color-secondary)',
              color: activeTab === 'PREP' ? '#000' : 'var(--color-text)',
              fontWeight: 'bold'
            }}
          >
            PREP LIST
          </button>
          <button
            onClick={() => setActiveTab('ORDER')}
            style={{
              backgroundColor: activeTab === 'ORDER' ? 'var(--color-accent)' : 'var(--color-secondary)',
              color: activeTab === 'ORDER' ? '#000' : 'var(--color-text)',
              fontWeight: 'bold'
            }}
          >
            ORDER LIST
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#222', padding: '0.5rem', borderRadius: '8px', border: '1px solid #444' }}>
          <span style={{ fontSize: '0.9em', color: '#888', marginRight: '0.5rem' }}>Add New {activeTab === 'PREP' ? 'Prep' : 'Order'} Item:</span>
          <input
            type="text"
            placeholder="Name"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
          />
          <input
            type="text"
            placeholder="Unit"
            value={newItemUnit}
            onChange={e => setNewItemUnit(e.target.value)}
            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', width: '80px' }}
          />
          <button 
            onClick={handleAddItem}
            disabled={!newItemName || !newItemUnit}
            style={{ 
              padding: '0.4rem 0.8rem', 
              backgroundColor: (!newItemName || !newItemUnit) ? '#444' : 'var(--color-success)',
              color: '#fff',
              cursor: (!newItemName || !newItemUnit) ? 'not-allowed' : 'pointer'
            }}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Ingredient</th>
              <th style={{ padding: '1rem' }}>Unit</th>
              <th style={{ padding: '1rem' }}>Sold</th>
              <th style={{ padding: '1rem' }}>Waste</th>
              <th style={{ padding: '1rem' }}>Prepped/Ordered</th>
              <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>NEEDED</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.map(state => {
              const needed = Math.max(0, (state.sold + state.waste) - state.prepped);
              
              return (
                <tr key={state.ingredientId} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{state.name}</td>
                  <td style={{ padding: '1rem', color: '#888' }}>{state.unit}</td>
                  <td style={{ padding: '1rem' }}>{state.sold.toFixed(1)}</td>
                  <td style={{ padding: '1rem' }}>{state.waste.toFixed(1)}</td>
                  <td style={{ padding: '1rem' }}>{state.prepped.toFixed(1)}</td>
                  <td style={{ padding: '1rem', color: needed > 0 ? 'var(--color-accent)' : '#4caf50', fontWeight: 'bold', fontSize: '1.1em' }}>
                    {needed.toFixed(1)}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        placeholder="Waste"
                        value={wasteInputs[state.ingredientId] || ''}
                        onChange={e => setWasteInputs(prev => ({ ...prev, [state.ingredientId]: e.target.value }))}
                        style={{
                          width: '80px',
                          padding: '0.4rem',
                          backgroundColor: '#222',
                          border: '1px solid #444',
                          color: '#fff',
                          borderRadius: '4px'
                        }}
                      />
                      <button 
                        onClick={() => handleWaste(state.ingredientId)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8em' }}
                      >
                        Add
                      </button>
                    </div>
                    
                    {needed > 0 && (
                      <button
                        onClick={() => handleAction(state.ingredientId, activeTab)}
                        style={{
                          backgroundColor: 'var(--color-success)',
                          color: '#fff',
                          padding: '0.4rem 1rem',
                          fontSize: '0.9em'
                        }}
                      >
                        {activeTab === 'PREP' ? 'PREP ALL' : 'ORDER ALL'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
