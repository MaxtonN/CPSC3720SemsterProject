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
<h1>Clemson Campus Events</h1>
<ul>
{events.map((event) => (
<li key={event.id}>
{event.name} - {event.date}{' '}
<button onClick={() => buyTicket(event.name)}>Buy
Ticket</button>
</li>
))}
</ul>
</div>
);
}
export default App;