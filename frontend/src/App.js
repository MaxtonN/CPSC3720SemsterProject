import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
const [events, setEvents] = useState([]);
useEffect(() => {
fetch('http://localhost:6001/api/events') // Changed port from 5000 to correctly show the buy ticket options on front end
.then((res) => res.json())
.then((data) => setEvents(data))
.catch((err) => console.error(err));
}, []);

const buyTicket = async (id) => {
  try {
    const response = await fetch(`http://localhost:6001/api/events/${id}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to purchase ticket!");
    }

    // Update ticket count in state
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? { ...event, available_tickets: event.available_tickets - 1 }
          : event
      )
    );

    alert("Ticket purchased successfully!");
  } catch (error) {
    console.error(error);
    alert("Error purchasing ticket. Try again");
  }
};

return (
<div className="App">
  <img 
  src = "/tigerpaw.png" 
  alt = "Clemson Tiger Paw" 
  className = "ClemsonLogo" 
  />
<h1>Clemson Campus Events</h1>
<ul>
{events.map((event) => (
<li key={event.id}>
  <strong>{event.name}</strong> – {new Date(event.date).toLocaleString()}
  <br />
  <em>Tickets Available:</em> {event.available_tickets}
  <br />
  <button
    onClick={() => buyTicket(event.id)}
    disabled={event.available_tickets <= 0}
    aria-label={`Buy ticket for ${event.name}`}
  >
    {event.available_tickets > 0 ? "Buy Ticket" : "Sold Out"}
  </button>
  <hr />
</li>
))}
</ul>
</div>
);
}
export default App;