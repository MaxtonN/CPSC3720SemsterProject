/**
 * TigerTix Frontend
 * displays Clemson campus events and includes accessibility features to assist visually impaired users
 * users can use tab and enter keys to navigate the site and purchase tickets
 */

import React, { useEffect, useState } from "react";
import "./App.css";

function BookingAssistantButton(props){

  return (
    <div id="BookingAssistantButton" onClick={() => props.setShowAssistant(true)}>
    </div>
  );
}

function Message(props){
  console.log(props.message);
  return (
  <div class="Message">
    {props.message}
  </div>
  );
}

function MessageList(props){
  return (
    <div id="MessageList">
      <ul id="MessageList-ul">
        {
          props.messages.map((message) => (
            <Message message={message}/>
          ))
        }
      </ul>
    </div>
  )
}

function ChatBotTextArea(props){
  return (
    <div id="ChatBotTextArea">
      <textarea id="ChatBotTextArea-textarea" placeholder="Enter message here..."></textarea>
      <div id="ChatBotTextAreaButtons">
        <div id = "ChatBotTextAreaVoiceButton">Voice</div>
        <div id = "ChatBotTextAreaSendButton">Send</div>
      </div>
    </div>
  )
}

function BookingAssistantChat(props){
  return (
    <div id="BookingAssistantChat">
      <div id="BookingAssistantChatHeader">
        <div id="BookingAssistantChatHeaderTitle">Booking Assistant</div>
        <div id="BookingAssistantChatHeaderExit" onClick={()=> props.setShowAssistant(false)}>X</div>
      </div>
      <div id="BookingAssistantChatPanel">
        <MessageList messages={props.messages} setMessages={props.setMessages}/>
        <ChatBotTextArea addMessages={props.addMessages}/>
      </div>
    </div>
  )
}


function App() {
  // stores data from the backend
  const [events, setEvents] = useState([]);

  /*
   * useEffect:
   * 
   * retrieves the list of campus events from the client microservice
   * 
   * returns:
   *  - nothing
   */
  useEffect(() => {
    fetch("http://localhost:6001/api/events") // Client service endpoint
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  // false -> show button; true -> show chatbot
  const [showAssistant, setShowAssistant] = useState(false);

  // stores messages between chat bot and user
  const [
    messages, 
    addMessage = (message) => {
      messages.push(message);
    }, 
    setMessages = (newMessages) => {
      messages = newMessages;
    }
  ] = useState(["Hello user what would you like me to do for you today?", "I want you to give me money!"]);

  console.log(messages);
  //setMessages(["Hello guest user, how can I help you today?"]);

  /*
   * buyTicket:
   * 
   * sends a POST request to the backend to purchase a ticket for a given event
   * ticket count is decremented 
   * 
   * inputs:
   *  - id → integer, the unique ID of the event being purchased
   * 
   * returns:
   *  - nothing
   */
  const buyTicket = async (id) => {
    try {
      const response = await fetch(`http://localhost:6001/api/events/${id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to purchase ticket.");
      }

      // update ticket count locally after user has purchase ticket
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id
            ? { ...event, available_tickets: event.available_tickets - 1 }
            : event
        )
      );

      alert("Ticket purchased successfully.");
    } catch (error) {
      console.error(error);
      alert("Error purchasing ticket. Please try again.");
    }
  };

  /*
   * page and image format and accesibility
   * 
   * has the webpage with a logo, page title, and  event list
   * each event contains a title, date, amount of tickets, and an purchase button
   * 
   * accessibility feats:
   *  - uses semantic HTML tags from project description
   *  - adds ARIA attributes for screen readers
   *  - ensures buttons are keyboard friendly (tab and enter) and clearly labeled
   * 
   * inputs:
   *  - none
   * 
   * returns:
   *  - elements representing the event list user interface
   */
  return (
    <main className="App" role="main" aria-labelledby="pageTitle">
      {/* header section with Clemson logo and page title */}
      <header className="App-header">
        <img
          src="/tigerpaw.png"
          alt="Clemson Tiger Paw logo"
          className="ClemsonLogo"
        />
        <h1 id="pageTitle">Clemson Campus Events</h1>
      </header>

      {/* event listings section */}
      <section aria-label="Available Campus Events">
        <ul className="eventList">
          {events.map((event) => (
            <li key={event.id} className="eventItem">
              {/* individual event section */}
              <article aria-labelledby={`event-${event.id}-title`}>
                <h2 id={`event-${event.id}-title`}>{event.name}</h2>
                <p>
                  <strong>Date:</strong> {new Date(event.date).toLocaleString()}
                </p>
                <p>
                  <strong>Tickets Available:</strong> {event.available_tickets}
                </p>

                {/* accessible option for purchase button */}
                <button
                  onClick={() => buyTicket(event.id)}
                  disabled={event.available_tickets <= 0} // disables button if tickets are sold out
                  aria-label={`Buy ticket for ${event.name}`}
                  className="buyButton"
                >
                  {event.available_tickets > 0 // display correct button text based on availability
                    ? `Buy Ticket for ${event.name}`
                    : "Sold Out"}
                </button>
              </article>
              <hr />
            </li>
          ))}
        </ul>
      </section>

      {showAssistant && (<BookingAssistantChat setShowAssistant={setShowAssistant} messages={messages} setMessages={setMessages} addMessage={addMessage}/>)}
      {!showAssistant && (<BookingAssistantButton setShowAssistant={setShowAssistant}/>)}

    </main>
  );
}

export default App;
