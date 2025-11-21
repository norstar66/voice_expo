import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Types (copied from backend for now)
type StationId = 'SALAD' | 'GRILL/SAUTE1' | 'SAUTE2' | 'FRY' | 'PIZZA' | 'EXPO';
type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';
type ItemStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';

interface TicketItem {
  id: string;
  name: string;
  stations: StationId[];
  status: ItemStatus;
  startedAt?: number;
  completedAt?: number;
  completedBy?: StationId;
  duration?: number; // in seconds
}

interface Ticket {
  id: string;
  tableNumber: string;
  timestamp: number;
  items: TicketItem[];
  status: TicketStatus;
}

// ---

const BRIDGE_URL = 'http://localhost:8787'; // Configurable

function ItemTimer({ startedAt }: { startedAt?: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    // Initial set
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));

    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span style={{ fontFamily: 'monospace', marginRight: '0.5rem', color: '#ff9800' }}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [connected, setConnected] = useState(false);

  // Unified State
  const [activeTab, setActiveTab] = useState<StationId | 'HISTORY'>('GRILL/SAUTE1');
  const STATIONS: StationId[] = ['GRILL/SAUTE1', 'SAUTE2', 'FRY', 'SALAD', 'PIZZA', 'EXPO'];

  useEffect(() => {
    const newSocket = io(BRIDGE_URL);

    newSocket.on('connect', () => {
      console.log('Connected to Bridge');
      setConnected(true);
      // Register as the active station (or EXPO if HISTORY is selected to get all data)
      const registrationId = activeTab === 'HISTORY' ? 'EXPO' : activeTab;
      newSocket.emit('REGISTER_STATION', { stationId: registrationId });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Bridge');
      setConnected(false);
    });

    newSocket.on('INITIAL_STATE', (initialTickets: Ticket[]) => {
      setTickets(initialTickets);
    });

    newSocket.on('TICKET_NEW', (ticket: Ticket) => {
      setTickets(prev => [...prev, ticket]);
    });

    newSocket.on('TICKET_UPDATED', (updatedTicket: Ticket) => {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [activeTab]); // Re-connect when tab changes to re-register

  const handleItemDone = (ticketId: string, itemId: string) => {
    if (!socket || activeTab === 'HISTORY') return;
    socket.emit('TICKET_ITEM_DONE', { ticketId, itemId, stationId: activeTab });
  };

  const handleItemStart = (ticketId: string, itemId: string) => {
    if (!socket || activeTab === 'HISTORY') return;
    socket.emit('TICKET_ITEM_START', { ticketId, itemId, stationId: activeTab });
  };

  const handleTicketCompleted = (ticketId: string) => {
    if (!socket || activeTab === 'HISTORY') return;
    socket.emit('TICKET_COMPLETED', { ticketId, stationId: activeTab });
  };

  // Helper to check if item belongs to this station
  const isItemForStation = (item: TicketItem) => {
    if (activeTab === 'HISTORY') return true; // Show all in history
    if (activeTab === 'EXPO') return true;
    return item.stations.includes(activeTab as StationId);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'HISTORY') {
      return ticket.status === 'DONE';
    } else {
      return ticket.status !== 'DONE';
    }
  });

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      overflow: 'hidden'
    }}>
      <header style={{ 
        padding: '2rem 2rem 1rem 2rem',
        borderBottom: '1px solid #333',
        flexShrink: 0 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/victors-logo.png" 
            alt="Victor's of York" 
            style={{ height: '80px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9em', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Voice Expo Station
            </span>
            <div style={{ fontSize: '0.8em', color: connected ? 'var(--color-success)' : '#ff5252' }}>
              {connected ? '● ONLINE' : '● OFFLINE'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STATIONS.map(station => (
            <button 
              key={station}
              onClick={() => setActiveTab(station)}
              style={{ 
                backgroundColor: activeTab === station ? 'var(--color-accent)' : 'var(--color-secondary)',
                color: activeTab === station ? '#000' : 'var(--color-text)',
                borderColor: 'transparent',
                flex: '1 0 auto',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {station}
            </button>
          ))}
          <button 
            onClick={() => setActiveTab('HISTORY')}
            style={{ 
              backgroundColor: activeTab === 'HISTORY' ? 'var(--color-success)' : 'var(--color-secondary)',
              color: '#fff',
              borderColor: 'transparent',
              flex: '1 0 auto',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            HISTORY
          </button>
        </div>
      </header>

      <div className="ticket-list" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '2rem' 
      }}>
        {filteredTickets.length === 0 && (
          <div style={{ width: '100%', textAlign: 'center', padding: '4rem', color: '#555' }}>
            <p style={{ fontSize: '1.2em', fontStyle: 'italic' }}>
              No {activeTab === 'HISTORY' ? 'completed' : 'active'} tickets for {activeTab}
            </p>
          </div>
        )}
        
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className={`ticket-card status-${ticket.status}`}>
            <div className="ticket-header">
              <div>
                <span style={{ fontSize: '1.2em', color: 'var(--color-accent)' }}>Table {ticket.tableNumber}</span>
                <span style={{ display: 'block', fontSize: '0.7em', fontWeight: 'normal', opacity: 0.7, marginTop: '0.2rem' }}>
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }).format(new Date(ticket.timestamp)).toUpperCase()}
                  <span style={{ margin: '0 0.5rem' }}>|</span>
                  {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }).format(new Date(ticket.timestamp))}
                </span>
              </div>
              <span style={{ fontSize: '0.8em', opacity: 0.5, fontFamily: 'monospace' }}>#{ticket.id.slice(0, 4)}</span>
            </div>
            
            <div className="ticket-items">
              {ticket.items.map(item => {
                const isForThisStation = isItemForStation(item);
                const itemStyle = {
                  opacity: isForThisStation ? 1 : 0.4,
                  color: isForThisStation ? 'inherit' : '#aaa',
                };

                return (
                  <div key={item.id} className="ticket-item" style={itemStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%' }}>
                      {item.status === 'NEW' && isForThisStation && activeTab !== 'HISTORY' && (
                        <button 
                          onClick={() => handleItemStart(ticket.id, item.id)}
                          style={{ 
                            padding: '0.3rem 0.8rem', 
                            fontSize: '0.75em', 
                            backgroundColor: 'transparent', 
                            border: '1px solid var(--color-accent)',
                            color: 'var(--color-accent)',
                            textTransform: 'uppercase'
                          }}
                        >
                          Start
                        </button>
                      )}
                      {item.status === 'IN_PROGRESS' && (
                        <ItemTimer startedAt={item.startedAt} />
                      )}
                      <span className={`status-${item.status}`} style={{ 
                        fontWeight: isForThisStation ? '700' : '400',
                        fontSize: isForThisStation ? '1.1em' : '1em',
                        flex: 1
                      }}>
                        {item.name}
                      </span>
                    </div>
                    
                    {item.status !== 'DONE' && isForThisStation && activeTab !== 'HISTORY' && (
                      <button 
                        onClick={() => handleItemDone(ticket.id, item.id)}
                        style={{
                          padding: '0.3rem 0.8rem',
                          fontSize: '0.75em',
                          backgroundColor: '#333',
                          border: '1px solid #555'
                        }}
                      >
                        Done
                      </button>
                    )}
                    {item.status === 'DONE' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--color-success)' }}>✓</span>
                        {activeTab === 'HISTORY' && item.duration && (
                          <span style={{ fontSize: '0.8em', color: '#888' }}>
                            ({Math.floor(item.duration / 60)}m {item.duration % 60}s)
                          </span>
                        )}
                        {activeTab === 'HISTORY' && item.completedBy && (
                          <span style={{ fontSize: '0.8em', color: '#888', fontStyle: 'italic' }}>
                            by {item.completedBy}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {activeTab === 'EXPO' && ticket.status !== 'DONE' && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                <button 
                  onClick={() => handleTicketCompleted(ticket.id)}
                  style={{ 
                    width: '100%', 
                    backgroundColor: 'var(--color-success)',
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  Complete Ticket
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer style={{ 
        padding: '1rem 2rem',
        borderTop: '1px solid #333', 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center', 
        gap: '0.5rem',
        opacity: 0.6,
        flexShrink: 0
      }}>
        <div style={{ fontSize: '0.8em', color: '#888' }}>
          &copy; 2025 Built by SIVERSE LABS
        </div>
        <img 
          src="/siverse-logo-new.png" 
          alt="SIVERSE Labs" 
          style={{ height: '30px' }} 
        />
      </footer>
    </div>
  );
}

export default App;
