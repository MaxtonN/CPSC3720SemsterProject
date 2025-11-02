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

function ChatBotTextArea(props){
  return (
    <div id="ChatBotTextArea">
      <textarea id="ChatBotTextArea-textarea" onKeyDown={async(event)=>{
          if(event.key === "Enter" && event.shiftKey !== true && event.target.value !== ""){
            event.preventDefault();

            // saving to messages, clearing text area
            const query = event.target.value;
            const newMessages = {
              items: [
                ...props.messages.items,
                {
                  message: query,
                  role:"user",
                  order:props.messages.items.length
                }
              ]
            };
            props.setMessages(newMessages);
            event.target.value = "";


            // sending message to llm-driven-booking
            const llmData = await sendLLMMessage(query);

            // checking if event exists
            const eventData = await getEventByName(llmData.event_name);
            console.log(eventData);
            
            // confirming that the user wants to book tickets
            if(llmData && llmData.intent === "book"){
              const confirmation = window.confirm("Are you sure");
              console.log(confirmation);
            }

            // book tickets + purchase tickets
          }
          else if(event.key === "Enter" && event.shiftKey !== true){
            event.preventDefault();
          }
        }
      } 
      placeholder="Enter message here..."></textarea>
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
        <ChatBotTextArea messages={messages} setMessages={setMessages}/>
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

      {showAssistant && (<BookingAssistantChat setShowAssistant={setShowAssistant}/>)}
      {!showAssistant && (<BookingAssistantButton setShowAssistant={setShowAssistant}/>)}

    </main>
  );
}

export default App;
