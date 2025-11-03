/**
 * TigerTix Frontend
 * displays Clemson campus events and includes accessibility features to assist visually impaired users
 * users can use tab and enter keys to navigate the site and purchase tickets
 */

import React, { useEffect, useState } from "react";
import "./App.css";


///////////////
// API CALLS //
///////////////

/* Sends the llm-driven-booking service the user message and returns the llm response
 *
 * userMessage --> string, the message from the user to be sent to the llm-driven-booking service
 *
 * returns --> JSON object containing the llm response with the following structure:
 *  - intent: string, the intent of the user (book)
 *  - event_name: string, the name of the event
 *  - ticket_amount: integer, the number of tickets to book
 * if the message could not be processed, returns a JSON object with an "error" key
 */
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

/* Retrieves event information by name from client-service
 *
 * eventName --> string, the name of the event to retrieve
 * 
 * returns --> JSON object containing the event information with the following structure:
 *  - id: integer, the unique ID of the event
 *  - name: string, the name of the event
 *  - date: string, the date of the event
 *  - available_tickets: integer, the number of available tickets for the event
 * If the event could not be found, returns a JSON object with an "error" key
 */
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

/* Retrieves events from client-service based on query parameters
 *
 * queryParams --> object, key-value pairs representing query parameters. Supported keys:
 *  - available_tickets: integer (searches for events with more tickets than given integer)
 *  - before: date (searches for events before given date)
 *  - after: date (searches for events after given date)
 * 
 * returns --> JSON object containing the events matching the query parameters. If query fails, returns a JSON object with an "error" key
 */
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

/* Purchases tickets for a given event through client-service. Will also update ticket count locall after purchase
 *
 * id --> integer, the unique ID of the event
 * ticket_amount --> integer, the number of tickets to purchase
 * setEvents --> function, React state setter function for events
 *
 * returns --> JSON object containing the SQL response from client-service. If purchase fails, returns a JSON object with an "error" key. If purchase is successful, returns JSON object with success message.
 */
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

/* Stores booking information booking table through client-service
 * 
 * event_name --> string, the name of the event being booked
 * ticket_count --> integer, the number of tickets being booked
 * 
 * returns --> JSON object containing the SQL response from client-service. If storing fails, returns a JSON object with an "error" key. If successful, returns JSON object response from SQL operation.
 */
const storeBooking = async (event_name, ticket_count) => {
  try{
    const response = await fetch("http://localhost:6001/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({event_name: event_name, ticket_count: ticket_count})
    });
    return await response.json();
  }
  catch(error){
    console.error("Error storing booking: ", error);
  }
};

/* gets all of the Events from the client-service. Stores in events with setEvents setter
 *
 * setEvents --> function, React state setter function for events
 */
const getEvents = async (setEvents) =>{
  try{
    fetch("http://localhost:6001/api/events") // Client service endpoint
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));
  }
  catch(error){
    console.error("Error fetching events: ", error);
  }
};


/* Get text-to-speech audio from text using the Speech Synthesis API. Plays audio directly in the browser.
 *
 * text --> string, the text to be converted to speech
 *
 * returns --> nothing
*/
const getTextToSpeech = async (text) =>{
  const utternace = new SpeechSynthesisUtterance(text);
  if(!utternace){
    console.error("Speech Synthesis API not supported in this browser.");
    addMessageToList("I'm sorry, your browser does not support the Speech Synthesis API. Please use a different browser or read the message yourself.", "assistant");
    return;
  }
  utternace.lang = 'en-US';
  utternace.rate = 1;
  utternace.pitch = 1;
  utternace.value = 1;

  window.speechSynthesis.speak(utternace);
  return;
};

///////////////////////
/// HELPER FUNCTIONS //
///////////////////////

/* plays a short beep sound; 
 * 
 * frequency --> integer, determines the frequency in hertz of the beep
 */
const playSound = (frequency) => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(!audioCtx){
    console.error("Web Audio API not supported in this browser.");
    return;
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = frequency; // frequency in hertz
  gainNode.gain.value = 0.5;
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, 100);
};

// plays a starting beep sound
const playStartingSound = () => {
  playSound(1000);
};

// plays a confirmation beep sound
const playEndingSound = () => {
  playSound(500);
};

/* Adds a message to the chat bot message list and vocalizes assistant messages with API call.
 *
 * setMessages --> function, React state setter function for messages
 * message --> string, the message to be added
 * role --> string, the role of the message sender ("user" or "assistant")
 *
 * returns --> nothing
 */
const addMessageToList = (setMessages, message, role) => {
  
  if(role === "assistant")
    getTextToSpeech(message);
  
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

/* Handles user input in the chat text area. Communicates with llm-driven-booking and client-service APIs to process booking requests and perform validation.
 *
 * event --> object, the key press event
 * props --> object, the component props. Contains setMessages and setEvents functions.
 *
 * returns --> nothing
 */
const handleTextArea = async (props) => {
  // saving to messages, clearing text area
  const query = document.getElementById("ChatBotTextArea-textarea").value;
  addMessageToList(props.setMessages, query, "user");
  document.getElementById("ChatBotTextArea-textarea").value = "";

  // handles see events requests
  if(query.toLowerCase().includes("show me events with available tickets")){
    const events = await getEventsQuery({available_tickets: 0});
    if(!events || events.error)
      addMessageToList(props.setMessages, "I'm sorry, there was an error retrieving events with available tickets. Please try again.", "assistant"); 
    else
      addMessageToList(props.setMessages, `Here are the events with available tickets: ${events.map(event => event.name).join(", ")}`, "assistant");
    return;
  }

  // sending message to llm-driven-booking
  const llmData = await sendLLMMessage(query);
  if(!llmData || llmData.error){
    addMessageToList(props.setMessages, "I'm sorry, there was an error processing your request. Please try again", "assistant");
    return;
  }

  // message validation
  llmData.event_name = llmData.event_name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // capitalizing event name for search
  const eventData = await getEventByName(llmData.event_name);
  if(!eventData || eventData.error){
    addMessageToList(props.setMessages, `I'm sorry, I couldn't find any event named "${llmData.event_name}". Please check the event name and try again.`, "assistant");
    return;
  }
  else if(eventData.available_tickets < llmData.ticket_amount){
    addMessageToList(props.setMessages, `I'm sorry, there are only ${eventData.available_tickets} tickets available for "${eventData.name}". Please adjust the ticket amount and try again.`, "assistant");
    return;
  }

  // asking for user confirmation
  const confirmation = window.confirm(`Would you like to book ${llmData.ticket_amount} ticket(s) for "${eventData.name}" on ${new Date(eventData.date).toLocaleString()}?`);
  if(!confirmation){
    addMessageToList(props.setMessages, "No problem! Let me know if there's anything else I can help you with.", "assistant");
    return;
  }
  

  // sending purchase to client-service    
  const purchaseResponse = await purchaseTickets(eventData.id, llmData.ticket_amount, props.setEvents);
  if(!purchaseResponse || purchaseResponse.error){
    addMessageToList(props.setMessages, "I'm sorry, there was an error purchasing your tickets. Please try again.", "assistant");
    return;
  }

  // sending booking to client-service
  const bookingResponse = await storeBooking(eventData.name, llmData.ticket_amount);
  if(!bookingResponse || bookingResponse.error){
    addMessageToList(props.setMessages, "I'm sorry, there was an error storing your booking information. Please try again.", "assistant");
    return;
  }

  // confirmation message to user
  addMessageToList(props.setMessages, `Great! Your ${llmData.ticket_amount} ticket(s) for "${eventData.name}" have been booked successfully.`, "assistant");
};

////////////////////
// EVENT HANDLERS //
////////////////////

/* Handles user input in the chat text area; executes on key press. Communicates with llm-driven-booking and client-service APIs to process booking requests and perform validation.
 *
 * event --> object, the key press event
 * props --> object, the component props. Contains setMessages and setEvents functions.
 *
 * returns --> nothing
 */
const handleTextAreaKeyDown = async (event, props) =>{
  if(event.key === "Enter" && event.shiftKey !== true && event.target.value !== ""){
    event.preventDefault();

    await handleTextArea(props);
  }
  else if(event.key === "Enter" && event.shiftKey !== true){
    event.preventDefault();
  }
}

/* Handles user input in the chat text area; executes on SendButton click. Communicates with llm-driven-booking and client-service APIs to process booking requests and perform validation.
 *
 * props --> object, the component props. Contains setMessages and setEvents functions.
 *
 * returns --> nothing
 */
const handleSendButtonClick = async (props) => {
  await handleTextArea(props);
};

/* Handles voice input in the chat text area; executes on VoiceButton click. Communicates with Speech Recognition API to transcribe user speech to text. 
 *
 * props --> object, the component props. Contains setMessages function.
 * recordingVoice --> boolean, whether the voice input is currently being recorded.
 * setRecordingVoice --> function, the state setter for recordingVoice.
 * transcript --> string, the current transcript of the voice input.
 * setTranscript --> function, the state setter for transcript.
 * transcriptRef --> object, a ref to the current transcript. Allows access to the latest transcript in event handlers.
 *
 * returns --> nothing
 */
const handleVoiceButtonClick = async (props, recordingVoice, setRecordingVoice, transcript, setTranscript, transcriptRef) => {
  // if already recording, stop
  if(recordingVoice && window.__speechRecognitionInstance){
    window.__speechRecognitionInstance.stop();
    return;
  }

  playStartingSound();

  // check for browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    console.error("Speech Recognition API not supported in this browser.");
    addMessageToList(props.setMessages, "I'm sorry, your browser does not support the Speech Recognition API. Please use a different browser or type your message.", "assistant");
    return;
  }

  // start recording
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  window.__speechRecognitionInstance = recognition;


  recognition.onresult = (event) => {
    const newTranscript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');

    setTranscript(newTranscript);
    transcriptRef.current = newTranscript;

    // updating text area with interim transcript
    const textarea = document.getElementById("ChatBotTextArea-textarea");
    textarea.value = transcriptRef.current;
  };

  recognition.onerror = (event) =>{
    console.error("Speech recognition error: ", event.error);
    addMessageToList(props.setMessages, "I'm sorry, there was an error with speech recognition. Please try again.", "assistant");
    setRecordingVoice(false);
    delete window.__speechRecognitionInstance;
  };
  
  recognition.onend = () => {
    // handling Speech recognition object cleanup
    console.log("Speech recognition ended.");
    console.log("Final transcript: ", transcriptRef.current);
    setRecordingVoice(false);
    delete window.__speechRecognitionInstance;
    playEndingSound();

    // updating text area with transcript
    const textarea = document.getElementById("ChatBotTextArea-textarea");
    textarea.value = transcriptRef.current;
    setTranscript("");
    transcriptRef.current = "";
  };
  
  
  setRecordingVoice(true);
  recognition.start();
}

//////////////////////
// REACT COMPONENTS //
//////////////////////

/* Button to open the booking assistant chat bot messaging panel. Uses aria-label for accessibility.
 *
 * props --> object, the component props. Contains setShowAssistant setter function.
 * 
 * returns --> JSX element representing the booking assistant button.
 */
function BookingAssistantButton(props){
  return (
    <div aria-label="Open booking assistant" role="button" tabIndex="0" id="BookingAssistantButton" onClick={() => props.setShowAssistant(true)} onKeyDown={(event) => { if(event.key === "Enter") props.setShowAssistant(true)}}>
      <img src="/chat.svg" alt="Booking Assistant" className="chat-icon"/>
    </div>
  );
}

/* Renders an individual message in the chat bot message list.
 *
 * props --> object, the component props. Contains message string and role string ("user" or "assistant").
 *
 * returns --> JSX element representing the message.
 */
function Message(props){
  if(props.role === "user")
    return (<div className="Message-user">{props.message}</div>);
  else
    return (<div className="Message-assistant">{props.message}</div>);
}

/* Renders the list of messages in the chat bot messaging panel. Updates the scroll position to the bottom when a new message is added.
 *
 * messages --> object, the messages state containing an array of message objects with structure:
 *   {
 *     message: string, the message content
 *     role: string, either "user" or "assistant"
 *     order: number, the order of the message in the list
 *   }
 * 
 * returns --> JSX element representing the message list.
 */
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

/* Text area for user input in the chat bot messaging panel. Contains Voice and Send buttons. Sets up state for voice recording and transcript management.
 * Uses aria-labels for accessibility.
 *
 * props --> object, the component props. Contains setMessages and setEvents functions.
 * 
 * returns --> JSX element representing the chat bot text area.
 */
function ChatBotTextArea(props){
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = React.useRef("");

  useEffect(() => { transcriptRef.current = transcript }, [transcript]);

  return (
    <div id="ChatBotTextArea">
      <textarea aria-label="Chat Bot Text Area" id="ChatBotTextArea-textarea" onKeyDown={ (event) => {handleTextAreaKeyDown(event, props)}} placeholder="Enter message here..."></textarea>
      <div id="ChatBotTextAreaButtons">
        <div 
          role="button" 
          tabIndex="0" 
          id = "ChatBotTextAreaVoiceButton" 
          onClick={() => { handleVoiceButtonClick(props, recordingVoice, setRecordingVoice, transcript, setTranscript, transcriptRef)}}
          onKeyDown={(event) => { if(event.key === "Enter") handleVoiceButtonClick(props, recordingVoice, setRecordingVoice, transcript, setTranscript, transcriptRef)}}
          aria-label="Start Recording Voice Button"
        >
          <img src="/mic.svg" alt="Voice" className="mic-icon"/>
        </div>
        <div 
          role="button" 
          tabIndex="0" 
          id = "ChatBotTextAreaSendButton" 
          onClick={()=>{ handleSendButtonClick(props)}}
          onKeyDown={(event) => { if(event.key === "Enter") handleSendButtonClick(props)}}
          aria-label="Send Message Button"
        >
          <img src="/send.svg" alt="Send" className="send-icon"/>
        </div>
      </div>
    </div>
  )
}

/* Pannel for the booking assistant chat bot. Contains header with title and exit button, message list, and chat bot text area. Sets up state for messages between user and assistant.
 *
 * props --> object, the component props. Contains setShowAssistant and setEvents functions.
 * 
 * returns --> JSX element representing the booking assistant chat bot pannel.
 */
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

  return (
    <div id="BookingAssistantChat">
      <div id="BookingAssistantChatHeader">
        <div id="BookingAssistantChatHeaderTitle">Booking Assistant</div>
        <div 
          role="button" 
          tabIndex="0" 
          id="BookingAssistantChatHeaderExit" 
          onClick={()=> props.setShowAssistant(false)}
          onKeyDown={(event) => { if(event.key === "Enter") props.setShowAssistant(false)}}
          aria-label="Close Booking Assistant Chat Panel"
        >
          <img src="/exit.svg" alt="Close" className="close-icon"/>
        </div>
      </div>
      <div id="BookingAssistantChatPanel">
        <MessageList messages={messages}/>
        <ChatBotTextArea messages={messages} setMessages={setMessages} setEvents={props.setEvents}/>
      </div>
    </div>
  )
}


/* Main application component. Displays Clemson campus events and includes accessibility features to assist visually impaired users. Users can use tab and enter keys to navigate the site and purchase tickets.
 * 
 * returns --> JSX element representing the main application.
 */
function App() {
  const [events, setEvents] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);

  // fetches all event rows on startup
  useEffect(() => {
    getEvents(setEvents);
  }, []);



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
