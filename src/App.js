import React, { useEffect, useState } from 'react'; 
import './App.css';
import display from './assets/Display.svg';
import down from './assets/down.svg';


const API_URL = 'https://api.quicksell.co/v1/internal/frontend-assignment';

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('priority');
  const [displayOpen, setDisplayOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  const handleGroupChange = (e) => {
    setGroupBy(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const groupTicketsByStatus = () => {
    return tickets.reduce((grouped, ticket) => {
      const status = ticket.status || 'Unknown';
      grouped[status] = grouped[status] || [];
      grouped[status].push(ticket);
      return grouped;
    }, {});
  };
  

  const groupTicketsByUser = () => {
    const grouped = {};
    users.forEach(user => {
      grouped[user.name] = [];
    });

    tickets.forEach(ticket => {
      const user = users.find(u => u.id === ticket.userId);
      if (user) {
        grouped[user.name].push(ticket);
      }
    });
    return grouped;
  };

  const groupTicketsByPriority = () => {
    return tickets.reduce((grouped, ticket) => {
      const priority = ticket.priority;
      const key = priority === 0 ? 'No Priority' :
                  priority >= 4 ? 'Urgent' :
                  priority === 3 ? 'High' :
                  priority === 2 ? 'Medium' : 'Low';
      grouped[key] = grouped[key] || [];
      grouped[key].push(ticket);
      return grouped;
    }, {});
  };

  const sortedTickets = (group) => {
    return group.sort((a, b) => {
      return sortBy === 'priority' ? (b.priority - a.priority) : a.title.localeCompare(b.title);
    });
  };

  const renderGroupedTickets = () => {
    let groupedTickets;
    if (groupBy === 'status') {
      groupedTickets = groupTicketsByStatus();
    } else if (groupBy === 'user') {
      groupedTickets = groupTicketsByUser();
    } else if (groupBy === 'priority') {
      groupedTickets = groupTicketsByPriority();
    }

    return Object.entries(groupedTickets).map(([key, group]) => (
      <div className="kanban-column" key={key}>
        <h2>{key} ({group.length})</h2>
        {sortedTickets(group).map(ticket => (
          <div className="ticket" key={ticket.id}>
            <h3>{ticket.id}: {ticket.title}</h3>
            <p>Priority: {ticket.priority}</p>
            {ticket.tag && ticket.tag.map(label => (
              <span className="label" key={label}>{label}</span>
            ))}
            <div className="assignees">
              <span>{ticket.userId}</span>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="App">
      <h1>Kanban Board</h1>

      <div className="controls">
        <div className="dropdown">
          <button onClick={() => setDisplayOpen(!displayOpen)} className="dropdown-toggle">
          <img src={display} alt="Display Icon" className="icon" />
          <span>  Display  </span>
          <img src={down} alt="Drop down" className="icon" />
          </button>

          {displayOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <label htmlFor="grouping">Grouping:</label>
                <select id="grouping" value={groupBy} onChange={handleGroupChange}>
                  <option value="status">Status</option>
                  <option value="user">User</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              <div className="dropdown-item">
                <label htmlFor="ordering">Ordering:</label>
                <select id="ordering" value={sortBy} onChange={handleSortChange}>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="kanban-board">
        {renderGroupedTickets()}
      </div>
    </div>
  );
}

export default App;
