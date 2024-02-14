import React, { useState, useEffect } from 'react';
import './App.css';

const initialPlayers = [
  { id: 1, playerName: 'Player 1', phoneNumber: '123-456-7890', status: 'Attending' },
  { id: 2, playerName: 'Player 2', phoneNumber: '987-654-3210', status: 'Not Attending' },
  // Adding initial players for test purposes 
];

const App = () => {
  const [players, setPlayers] = useState(initialPlayers);
  const [newPlayer, setNewPlayer] = useState({ id: '', playerName: '', phoneNumber: '', status: 'Attending' });
const [editPlayer, setEditPlayer] = useState(null);

useEffect(() => {
  const interval = setInterval(() => {
    fetch(`/api/players`)
      .then((response) => response.json())
      .then((data) => {
        setPlayers(data);
      });
  }, 3000); 

  return () => clearInterval(interval); 
}, []);

useEffect(() => {
  fetch(`/api/players`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setPlayers(data);
    })
    .catch(error => {
      console.error('There was an error fetching players:', error);
    });
}, []);

const [sessions, setSessions] = useState([]);
const [recentSession, setRecentSession] = useState({});
useEffect(() => {
  fetch('/api/sessions')
    .then(response => response.json())
    .then(data => {
      const lastSession = data[data.length - 1]; // Get the most recent session
      setRecentSession(lastSession);
    })
    .catch(error => console.error('Error:', error));
}, []);

const [showSessionForm, setShowSessionForm] = useState(false);

const setSessionDate = () => {
  const month = document.getElementById("monthDropdown").value;
  const day = document.getElementById("dayDropdown").value;
  const year = document.getElementById("yearDropdown").value;

  fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      month: month,
      day: day,
      year: year,
    }),
  })
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch((error) => console.error('Error:', error));
};

const handleStatusChange = (playerId, newStatus) => {
  setPlayers(players.map(player => {
    if (player.id === playerId) {
      return { ...player, status: newStatus };
    }
    return player;
  }));

  fetch(`/api/players/${playerId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Status updated successfully', data);
  })
  .catch(error => {
    console.error('Error updating status:', error);
  });
};

const handleTextButtonClick = (playerName, id) => {

  alert(`Initiating the send a text function call`);
  
  const playerToText = players.find(player => player.id === id);
  alert(`Trying to send a text to ${playerName} with id: ${playerToText.id}`);    
  if (playerToText) {
      fetch(`/api/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerToText),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        alert(`Invited ${playerName} by text message`);
      })
      .catch(error => {
        alert(`Error sending  a text to ${playerName} with id: ${playerToText.id}`);
      });
    }
  };
  
  const handleAddPlayer = () => { 
    if (newPlayer.playerName && newPlayer.phoneNumber) {
      fetch("/api/players", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',          
        },
        body: JSON.stringify(newPlayer),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        alert(`${data.playerName} added to database with ID: ${data.id}`); 
        setPlayers(prevPlayers => [...prevPlayers, data]);
      })
      .then(() => {
        setNewPlayer({ playerName: '', phoneNumber: '', status: 'Attending' });
      })
      .catch(error => {
        console.error('There was an error!', error);
        alert('There was an error!'); 
      });
    } else {
      console.error('Missing playerName or phoneNumber');
      alert('Missing playerName or phoneNumber');
    }
  };
  const handleEditClick = (player) => {
    setEditPlayer(player );
  };

  const handleDeleteClick = (id) => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }
  
    fetch(`/api/players/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',          
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to delete player with id ${id}. Status: ${response.status}`);
        }
        setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== id));
      })
      .catch(error => {
        console.error('Error deleting the player:', error);
        alert(`An error occurred: ${error.message}`);
      });
    };
      
  

  const handleSaveClick = (id) => {
    const playerToUpdate = players.find(player => player.id === id);
    
    if (playerToUpdate) {
      const updatedData = { ...playerToUpdate, ...editPlayer };
  
      fetch(`/api/players/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        setPlayers(players.map(player => player.id === id ? updatedData : player));
      })
      .catch(error => {
        console.error('Error updating player:', error);
      });
    }
  
    setEditPlayer(null);
  };
  

  const handleCancelClick = () => {
    setEditPlayer(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditPlayer(prev => ({ ...prev, [name]: value }));
  };
  
  return (
  <div className="App">

  <div id="title">
    <h1>Tavern11</h1>
  </div>
  <div id="sessionDisplay">
  <h2>Session Info</h2>
  {Object.keys(recentSession).length > 0 ? (
      <h4>Scheduled Session: {`${recentSession.month}/${recentSession.day}/${recentSession.year}`}</h4>
    ) : (
      <h4>Loading or no sessions available...</h4>
    )}  <button id="addSessionBtn" onClick={() => setShowSessionForm(true)}>Add new session</button>
    {showSessionForm&& (
      <div id="sessionForm" >
    <select id="monthDropdown">
      <option value="1">January</option>
      <option value="2">February</option>
      <option value="3">March</option>
    </select>
    <select id="dayDropdown">
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
    <select id="yearDropdown">
      <option value="2021">2021</option>
      <option value="2022">2022</option>
    </select>
    <button onClick={() => setShowSessionForm(false)}>Cancel</button>
    <button onClick={() => setSessionDate()}>Save Date</button>
  </div>
    )}
    </div>

  <div id="playerTable">
    <h2>Current Players</h2>
    <table>
      <thead>
        <tr>
          <th>Edit</th>
          <th>Name</th>
          <th>Phone Number</th>
          <th>Status</th>
          <th>Send SMS Invite</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) => (
          <tr key={player.id}>
            <td>
        {editPlayer && editPlayer.id === player.id ? (
          <>
            <button onClick={() => handleSaveClick(player.id)}>Save</button>
            <button onClick={handleCancelClick}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => handleEditClick(player)}>Edit</button>
          </>
        )}
      </td>
              <td>
                {editPlayer && editPlayer.id === player.id ? (
                  <input
                    type="text"
                    name="playerName"
                    value={editPlayer.playerName}
                    onChange={handleChange}
                  />
                ) : (
                  player.playerName
                )}
              </td>
              <td>
                {editPlayer && editPlayer.id === player.id ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editPlayer.phoneNumber}
                    onChange={handleChange}
                  />
                ) : (
                  player.phoneNumber
                )}
              </td>
              <td>
                  <select
                    name="status"
                    value={player.isAttending ? "Attending" : "Not Attending"}
                    onChange={(e) => handleStatusChange(player.id, e.target.value)}
                  >
                    <option value="Attending">Attending</option>
                    <option value="Not Attending">Not Attending</option>
                  </select>
              </td>
              <td>
                {editPlayer && editPlayer.id  === player.id ? (
                  <>
                    <button onClick={() => handleDeleteClick(player.id)}>Delete</button> {/* Add this line */}
                    <button onClick={() => handleSaveClick(player.id)}>Save</button>
                    <button onClick={handleCancelClick}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleTextButtonClick(player.playerName, player.id)}>
                      Invite
                    </button>
                  </>
                )}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
  </div>

  <div id="addPlayer">
      <h2>Add New Player Here</h2>
        <label>Name:</label>
        <input
          type="text"
          value={newPlayer.playerName}
          aria-placeholder='Enter new player name here'
          onChange={(e) => setNewPlayer({ ...newPlayer, playerName: e.target.value })}
        />
      </div>
      <div>
        <label>Phone Number:</label>
        <input
          type="text"
          value={newPlayer.phoneNumber}
          aria-placeholder='Enter new phone number here'
          onChange={(e) => setNewPlayer({ ...newPlayer, phoneNumber: e.target.value })}
        />
      </div>
      <div>
        <label>Status:</label>
        <select
          value={newPlayer.status}
          onChange={(e) => setNewPlayer({ ...newPlayer, status: e.target.value })}
        >
          <option value="Attending">Attending</option>
          <option value="Not Attending">Not Attending</option>
        </select>
      </div>
      <div>
        <button onClick={handleAddPlayer}>Add Player</button>
  </div>
</div>
  );
  }
export default App;