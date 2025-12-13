import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { PrepOrderView } from './PrepOrderView';

// Types (copied from backend)
type StationId = 'SALAD' | 'GRILL' | 'SAUTE1' | 'SAUTE2' | 'FRY' | 'PIZZA' | 'EXPO' | 'SERVER';
type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';
type ItemStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';
type Course = 'appetizer' | 'main' | 'desert';
type HoldStatus = 'HOLD' | 'FIRED';

interface TicketItem {
  id: string;
  name: string;
  stations: StationId[];
  status: ItemStatus;
  course?: Course;
  holdStatus?: HoldStatus;
  firedAt?: number;
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

// --- Configuration ---

const BRIDGE_URL = 'http://localhost:8787';

const STATION_COLORS: Record<string, string> = {
  SAUTE1: 'orange',
  SAUTE2: '#00BFFF', // Deep Sky Blue for better visibility
  GRILL: '#32CD32',  // Lime Green
  DEFAULT: '#aaa',
};

// Tabs configuration
const TABS = [
  { id: 'SAUTE_GRILL', label: 'Saute / Grill', members: ['SAUTE1', 'SAUTE2', 'GRILL'] },
  { id: 'FRY', label: 'Fry', members: ['FRY'] },
  { id: 'SALAD', label: 'Salad', members: ['SALAD'] },
  { id: 'PIZZA', label: 'Pizza', members: ['PIZZA'] },
  { id: 'EXPO', label: 'Expo', members: ['EXPO'] },
  { id: 'SERVER', label: 'Server', members: ['SERVER'] },
];

function ItemTimer({ startedAt }: { startedAt?: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
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

function TicketCard({ 
  ticket, 
  activeTab, 
  handleItemStart, 
  handleItemDone, 
  handleTicketCompleted, 
  handleFireCourse,
  isItemForActiveStation 
}: { 
  ticket: Ticket, 
  activeTab: string,
  handleItemStart: (tId: string, iId: string) => void,
  handleItemDone: (tId: string, iId: string) => void,
  handleTicketCompleted: (tId: string) => void,
  handleFireCourse: (tId: string, course: Course) => void,
  isItemForActiveStation: (item: TicketItem) => boolean
}) {
  const [expanded, setExpanded] = useState(true);

  // Group items by course
  const courses: Record<string, TicketItem[]> = {
    appetizer: [],
    main: [],
    desert: [],
    other: []
  };

  const courseOrder: string[] = ['appetizer', 'main', 'desert', 'other'];

  ticket.items.forEach(item => {
    const c = item.course || 'other';
    if (courses[c]) {
      courses[c].push(item);
    } else {
      courses['other'].push(item);
    }
  });

  // Check if App was sent
  const appSent = ticket.items.some(i => i.course === 'appetizer' && i.status === 'DONE');
  const appSentTime = ticket.items.find(i => i.course === 'appetizer' && i.status === 'DONE')?.completedAt;

  const toggleExpand = () => setExpanded(!expanded);

  if (!expanded) {
    return (
      <div className={`ticket-card status-${ticket.status}`} style={{ marginBottom: '1rem', padding: '1rem' }} onClick={toggleExpand}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Table {ticket.tableNumber}</span>
          <span style={{ fontFamily: 'monospace' }}>#{ticket.id.slice(0, 4)}</span>
        </div>
      </div>
    );
  }

  return (
    <div key={ticket.id} className={`ticket-card status-${ticket.status}`}>
      <div className="ticket-header" onClick={toggleExpand} style={{ cursor: 'pointer' }}>
        <div>
          <span style={{ fontSize: '1.5em', color: 'var(--color-accent)' }}>Table {ticket.tableNumber}</span>
          <span style={{ display: 'block', fontSize: '0.8em', opacity: 0.7, marginTop: '0.2rem' }}>
            {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(ticket.timestamp))}
          </span>
          {appSent && appSentTime && (
            <span style={{ display: 'block', fontSize: '0.8em', color: 'var(--color-success)', marginTop: '0.2rem' }}>
              Appetizer Sent: {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(appSentTime))}
            </span>
          )}
        </div>
        <span style={{ fontSize: '1em', opacity: 0.5, fontFamily: 'monospace' }}>#{ticket.id.slice(0, 4)}</span>
      </div>
      
      <div className="ticket-items">
        {courseOrder.map(courseKey => {
          const courseItems = courses[courseKey];
          if (courseItems.length === 0) return null;
          
          const isHold = courseItems.some(i => i.holdStatus === 'HOLD');
          
          return (
            <div key={courseKey} style={{ marginBottom: '1rem' }}>
              {courseKey !== 'other' && (
                <div style={{ 
                  textTransform: 'uppercase', 
                  fontSize: '0.8rem', 
                  color: isHold ? '#ff5252' : '#888', 
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid #333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{courseKey}</span>
                  {isHold && activeTab !== 'HISTORY' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleFireCourse(ticket.id, courseKey as Course); }}
                      style={{
                        backgroundColor: '#ff5252',
                        color: 'white',
                        border: 'none',
                        padding: '2px 8px',
                        fontSize: '0.9em',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      FIRE
                    </button>
                  )}
                </div>
              )}

              {courseItems.map(item => {
                // Determine membership
                const isRelevant = isItemForActiveStation(item);
                
                // Color logic
                let itemColor = 'inherit';
                if (isRelevant) {
                   // Check specific stations for color
                   if (item.stations.includes('SAUTE1')) itemColor = STATION_COLORS.SAUTE1;
                   else if (item.stations.includes('SAUTE2')) itemColor = STATION_COLORS.SAUTE2;
                   else if (item.stations.includes('GRILL')) itemColor = STATION_COLORS.GRILL;
                }

                // Opacity logic
                const opacity = isRelevant ? 1 : 0.3;

                // Hold logic
                const onHold = item.holdStatus === 'HOLD';
                const displayColor = onHold ? '#ff5252' : itemColor;

                return (
                  <div key={item.id} className="ticket-item" style={{ opacity, color: displayColor, borderLeft: onHold ? '3px solid #ff5252' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%' }}>
                      {!onHold && item.status === 'NEW' && isRelevant && activeTab !== 'HISTORY' && activeTab !== 'EXPO' && (
                        <button 
                          onClick={() => handleItemStart(ticket.id, item.id)}
                          style={{ 
                            padding: '0.3rem 0.8rem', 
                            fontSize: '0.75em', 
                            backgroundColor: 'transparent', 
                            border: `1px solid ${displayColor === 'inherit' ? 'var(--color-accent)' : displayColor}`,
                            color: displayColor === 'inherit' ? 'var(--color-accent)' : displayColor,
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
                        fontWeight: isRelevant ? '700' : '400',
                        fontSize: isRelevant ? '1.1em' : '1em',
                        flex: 1
                      }}>
                        {item.name}
                      </span>
                    </div>
                    
                    {!onHold && item.status !== 'DONE' && isRelevant && activeTab !== 'HISTORY' && activeTab !== 'EXPO' && (
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
                      </div>
                    )}
                  </div>
                );
              })}
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
  );
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [connected, setConnected] = useState(false);

  // Active Tab ID (can be a Group ID or StationID or Special)
  const [activeTabId, setActiveTabId] = useState<string>('SAUTE_GRILL');

  useEffect(() => {
    const newSocket = io(BRIDGE_URL);

    newSocket.on('connect', () => {
      console.log('Connected to Bridge');
      setConnected(true);
      
      // Determine what to register as
      // For groups, we might need to register for multiple, OR the backend groups us.
      // Current backend implementation of 'REGISTER_STATION' joins a socket room.
      // If we are 'SAUTE_GRILL', we want to hear about SAUTE1, SAUTE2, GRILL.
      // But server updates are mostly broadcast to ALL stations now (per update in server.ts step 110),
      // except for INITIAL_STATE which is specific.
      // To get correct INITIAL_STATE for a group, we might need to loop and register?
      // Or we just register as one of them, but that's messy.
      // Let's rely on the fact that we can register as a "Group" if backend supported it, 
      // OR just register for all members.
      
      const tab = TABS.find(t => t.id === activeTabId);
      if (tab) {
        tab.members.forEach(memberId => {
           newSocket.emit('REGISTER_STATION', { stationId: memberId });
        });
      }
      
      if (activeTabId === 'HISTORY' || activeTabId === 'PREP_ORDER') {
        newSocket.emit('REGISTER_STATION', { stationId: 'EXPO' });
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('INITIAL_STATE', (initialTickets: Ticket[]) => {
      // If we register multiple times, we might get multiple initial states.
      // We should merge them or just replace? 
      // Since all active stations get ALL active tickets now (per store.ts change),
      // any single registration should give us the full list of active tickets.
      // So merging by ID is safe.
      setTickets(prev => {
        const map = new Map(prev.map(t => [t.id, t]));
        initialTickets.forEach(t => map.set(t.id, t));
        return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    newSocket.on('TICKET_NEW', (ticket: Ticket) => {
      setTickets(prev => {
        if (prev.find(t => t.id === ticket.id)) return prev;
        return [...prev, ticket].sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    newSocket.on('TICKET_UPDATED', (updatedTicket: Ticket) => {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [activeTabId]);

  const handleItemDone = (ticketId: string, itemId: string) => {
    if (!socket || activeTabId === 'HISTORY') return;
    // We need to send the valid StationID that completed it.
    // If we are in a group, we need to know WHICH station in the group.
    // But the socket handler expects 'stationId'.
    // Ideally use the first station of the item that matches our group?
    const ticket = tickets.find(t => t.id === ticketId);
    const item = ticket?.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Find intersection of item stations and active group members
    const tabMembers = TABS.find(t => t.id === activeTabId)?.members || [];
    const relevantStation = item.stations.find(s => tabMembers.includes(s));
    
    if (relevantStation) {
      socket.emit('TICKET_ITEM_DONE', { ticketId, itemId, stationId: relevantStation });
    }
  };

  const handleItemStart = (ticketId: string, itemId: string) => {
    if (!socket || activeTabId === 'HISTORY') return;
    const ticket = tickets.find(t => t.id === ticketId);
    const item = ticket?.items.find(i => i.id === itemId);
    if (!item) return;

    const tabMembers = TABS.find(t => t.id === activeTabId)?.members || [];
    const relevantStation = item.stations.find(s => tabMembers.includes(s));

    if (relevantStation) {
      socket.emit('TICKET_ITEM_START', { ticketId, itemId, stationId: relevantStation });
    }
  };

  const handleTicketCompleted = (ticketId: string) => {
    if (!socket) return;
    socket.emit('TICKET_COMPLETED', { ticketId, stationId: 'EXPO' });
  };

  const handleFireCourse = (ticketId: string, course: string) => {
    if (!socket) return;
    // Fire course using the first member of the group as 'sender'
    const tabMembers = TABS.find(t => t.id === activeTabId)?.members || [];
    const stationId = tabMembers[0] || 'EXPO';
    socket.emit('TICKET_FIRE_COURSE', { ticketId, course, stationId });
  };

  const isItemForActiveStation = (item: TicketItem) => {
    if (activeTabId === 'HISTORY' || activeTabId === 'EXPO') return true;
    const tab = TABS.find(t => t.id === activeTabId);
    if (!tab) return false;
    return item.stations.some(s => tab.members.includes(s));
  };

  const filteredTickets = tickets.filter(ticket => {
    // History Tab
    if (activeTabId === 'HISTORY') {
      return ticket.status === 'DONE';
    }
    
    // If ticket is DONE, we only show it if we are EXPO (History fallback?) 
    // OR if we want to show completed tickets in station view temporarily?
    // Requirement says: "Ghost tickets... tickets should be able to expand and collapse... allow us to easily see whatever ticket that needs to be viewed"
    // AND "When tickets are cleared, they move to history. We do not need ghost tickets here."
    if (ticket.status === 'DONE') return false;

    return true; // Show all active tickets (Ghost tickets enabled)
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
              Station: {TABS.find(t => t.id === activeTabId)?.label || activeTabId}
            </span>
            <div style={{ fontSize: '0.8em', color: connected ? 'var(--color-success)' : '#ff5252' }}>
              {connected ? '● ONLINE' : '● OFFLINE'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{ 
                backgroundColor: activeTabId === tab.id ? 'var(--color-accent)' : 'var(--color-secondary)',
                color: activeTabId === tab.id ? '#000' : 'var(--color-text)',
                borderColor: 'transparent',
                flex: '1 0 auto',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {tab.label}
            </button>
          ))}
          <button 
            onClick={() => setActiveTabId('HISTORY')}
            style={{ 
              backgroundColor: activeTabId === 'HISTORY' ? 'var(--color-success)' : 'var(--color-secondary)',
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
          <button 
            onClick={() => setActiveTabId('PREP_ORDER')}
            style={{ 
              backgroundColor: activeTabId === 'PREP_ORDER' ? 'var(--color-accent)' : 'var(--color-secondary)',
              color: activeTabId === 'PREP_ORDER' ? '#000' : '#fff',
              borderColor: 'transparent',
              flex: '1 0 auto',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            PREP & ORDER
          </button>
        </div>
      </header>

      {activeTabId === 'PREP_ORDER' ? (
        <PrepOrderView socket={socket} />
      ) : (
        <div className="ticket-list" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '2rem' 
        }}>
          {filteredTickets.length === 0 && (
            <div style={{ width: '100%', textAlign: 'center', padding: '4rem', color: '#555' }}>
              <p style={{ fontSize: '1.2em', fontStyle: 'italic' }}>
                No active tickets
              </p>
            </div>
          )}
          
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              activeTab={activeTabId}
              handleItemStart={handleItemStart}
              handleItemDone={handleItemDone}
              handleTicketCompleted={handleTicketCompleted}
              handleFireCourse={handleFireCourse}
              isItemForActiveStation={isItemForActiveStation}
            />
          ))}
        </div>
      )}

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
