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
  if(props.role === "user")
    return (<div className="Message-user">{props.message}</div>);
  else
    return (<div className="Message-assistant">{props.message}</div>);
}

function MessageList({messages}){

  // scrolls to the bottom of the message list when a new message is added
  useEffect(() =>{
    const scrollableElement = document.getElementById("MessageList");
    if(scrollableElement){
      setTimeout(() => {
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
      }, 50);
    }
  }, [messages]);

  return (
    <div id="MessageList">
      <ul id="MessageList-ul">
        {
          messages.items.map((message) => (
            <Message key={message.order} message={message.message} role={message.role}/>
          ))
        }
      </ul>
    </div>
  )
}

// sends the llm-driven-booking service the user message and returns the llm response
const sendLLMMessage = async (userMessage) => {
  try {
    const response = await fetch("http://localhost:8080/api/llm/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": true
      },
      body: JSON.stringify({message: userMessage})
    });

    const data = await response.json();
    return data;
  }
  catch(error){
    console.error("Error sending message: ", error);
  }
};

// retrieves event information by name from client-service
const getEventByName = async (eventName) => {
  try{
    const response = await fetch(`http://localhost:6001/api/events/name/${encodeURIComponent(eventName)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    return data;
  }
  catch(error){
    console.error("Error fetching event by name: ", error);
  }
};

// retrieves events based on query parameters from client-service
const getEventsQuery = async (queryParams) => {
  try{
    const response = await fetch(`http://localhost:6001/api/events/query?${new URLSearchParams(queryParams)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    return await response.json();
  }
  catch(error){
    console.error("Error fetching events with query: ", error);
  }
}

// adds a message to the message list with the given role; will update all components using the messages state
const addMessageToList = (setMessages, message, role) => {
  setMessages((prevMessages) => {
    const order = prevMessages.items.length;
    return {
      items: [
        ...prevMessages.items,
        {
          message: message,
          role: role,
          order: order
        }
      ]
    };
  });
};

// purchases a given amount of tickets for an event through the client-service, does not check if tickets are available
const purchaseTickets = async (id, ticket_amount, setEvents) => {
  try{
    const response = await fetch(`http://localhost:6001/api/events/${id}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ticket_amount: ticket_amount})
    });

    // update ticket count locally after user has purchase ticket
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? { ...event, available_tickets: event.available_tickets - ticket_amount }
          : event
      )
    );

    return await response.json();
  }
  catch(error){
    console.error("Error purchasing tickets: ", error);
  }
};

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
const buyTicket = async (id, setEvents) => {
  try {
    const response = await fetch(`http://localhost:6001/api/events/${id}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_amount: 1 })
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

// stores booking information in shared-db through booking-service
const storeBooking = async (event_name, ticket_amount) => {
  try{
    const response = await fetch("http://localhost:6001/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({event_name: event_name, ticket_amount: ticket_amount})
    });
    return await response.json();
  }
  catch(error){
    console.error("Error storing booking: ", error);
  }
};

// handles user input in the chat text areas
const handleTextAreaKeyDown = async (event, props) =>{
  if(event.key === "Enter" && event.shiftKey !== true && event.target.value !== ""){
    event.preventDefault();

    // saving to messages, clearing text area
    const query = event.target.value;
    addMessageToList(props.setMessages, query, "user");
    event.target.value = "";

    // if the user is requesting to see events with available tickets; show those events
    if(query.toLowerCase().includes("show me events with available tickets".toLowerCase())){
      const events = await getEventsQuery({available_tickets: 0});
      if(!events || events.error){
        addMessageToList(props.setMessages, "I'm sorry, there was an error retrieving events with available tickets. Please try again.", "assistant");
        return;
      }
      else{
        addMessageToList(props.setMessages, `Here are the events with available tickets: ${events.map(event => event.name).join(", ")}`, "assistant");
        return;
      }
    }

    // sending message to llm-driven-booking
    const llmData = await sendLLMMessage(query);
    if(!llmData || llmData.error){
      addMessageToList(props.setMessages, "I'm sorry, there was an error processing your request. Please try again", "assistant");
      return;
    }

    // checking if event exists; if it does confirm booking with the user
    const eventData = await getEventByName(llmData.event_name);
    if(!eventData || eventData.error){
      addMessageToList(props.setMessages, `I'm sorry, I couldn't find any event named "${llmData.event_name}". Please check the event name and try again.`, "assistant");
      return;
    }
    else{
      const confirmation = window.confirm(`Would you like to book ${llmData.ticket_amount} ticket(s) for "${eventData.name}" on ${new Date(eventData.date).toLocaleString()}?`);
      console.log(eventData);
      if(confirmation){

        if(eventData.available_tickets < llmData.ticket_amount){
          addMessageToList(props.setMessages, `I'm sorry, there are only ${eventData.available_tickets} tickets available for "${eventData.name}". Please adjust the ticket amount and try again.`, "assistant");
          return;
        }

        // booking confirmed; purchase tickets through client-service and store booking in shared-db; how do I make both of these work? questions for when I have more time...
        const purchaseResponse = await purchaseTickets(eventData.id, llmData.ticket_amount, props.setEvents);
        if(!purchaseResponse || purchaseResponse.error){
          addMessageToList(props.setMessages, "I'm sorry, there was an error purchasing your tickets. Please try again.", "assistant");
          return;
        }
        const bookingResponse = await storeBooking(eventData.name, llmData.ticket_amount);
        if(!bookingResponse || bookingResponse.error){
          addMessageToList(props.setMessages, "I'm sorry, there was an error storing your booking information. Please try again.", "assistant");
          return;
        }

        addMessageToList(props.setMessages, `Great! Your ${llmData.ticket_amount} ticket(s) for "${eventData.name}" have been booked successfully.`, "assistant");
        return;
      }
      else{
        addMessageToList(props.setMessages, "No problem! Let me know if there's anything else I can help you with.", "assistant");
      }
    }
  }
  else if(event.key === "Enter" && event.shiftKey !== true){
    event.preventDefault();
  }
}

function ChatBotTextArea(props){
  return (
    <div id="ChatBotTextArea">
      <textarea id="ChatBotTextArea-textarea" onKeyDown={ (event) => {handleTextAreaKeyDown(event, props)}} placeholder="Enter message here..."></textarea>
      <div id="ChatBotTextAreaButtons">
        <div id = "ChatBotTextAreaVoiceButton">Voice</div>
        <div id = "ChatBotTextAreaSendButton" onClick={()=>{
          const target = document.getElementById("ChatBotTextArea-textarea");
          if(target.value !== ""){
            const newMessages = {
              items: [
                ...props.messages.items,
                {
                  message: target.value,
                  role:"user",
                  order:props.messages.items.length
                }
              ]
            };
            props.setMessages(newMessages);
            target.value = "";
          }
        }}>Send</div>
      </div>
    </div>
  )
}

function BookingAssistantChat(props){

  // stores messages between chat bot and user
  const [ messages, setMessages] = useState(
    {
      items: [
        {
          message:'Hello user what would you like me to do for you today?', 
          role:"assistant",
          order: 0
        }
      ]
    }
  );


  /*
  //communication with llm-driven-booking
  useEffect(()=>{
    // runs when the user sends a message
    const sendMessage = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/llm/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": true
          },
          body: JSON.stringify({message: messages.items[messages.items.length-1].message})
        });

        const data = await response.json();
        return data;
      }
      catch(error){
        console.error("Error sending message: ", error);
      }
    };

    // if the most recent message is by the user then send to the llm
    const handleSendMessage = async () =>{
      if (messages.items.length > 0 && messages.items[messages.items.length-1].role === "user"){
        const data = await sendMessage();

        if(data && data.intent === "book"){
          //confirm("Would you like to book a ticket for " + data.event_name + "?");
        }
      }
    };

    handleSendMessage();

  }, [messages])*/

  return (
    <div id="BookingAssistantChat">
      <div id="BookingAssistantChatHeader">
        <div id="BookingAssistantChatHeaderTitle">Booking Assistant</div>
        <div id="BookingAssistantChatHeaderExit" onClick={()=> props.setShowAssistant(false)}>X</div>
      </div>
      <div id="BookingAssistantChatPanel">
        <MessageList messages={messages}/>
        <ChatBotTextArea messages={messages} setMessages={setMessages} setEvents={props.setEvents}/>
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
                  onClick={() => buyTicket(event.id, setEvents)}
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

      {showAssistant && (<BookingAssistantChat setShowAssistant={setShowAssistant} setEvents={setEvents}/>)}
      {!showAssistant && (<BookingAssistantButton setShowAssistant={setShowAssistant}/>)}

    </main>
  );
}

export default App;
