- Notes on how to implement an llm / audio service to the current codebase

- I have to limit what the AI is allowed to say/do --> wrapper to strangle the AI / re-ask certain questions

- Greeting the user ( apparently we do not have to implement a login/signup service yet, treat all users as guest   
    users) --> implications:
    - Originally the ticketing system was going to require the user to have a name to avoid repeating bookings;
        this will no longer work. For a guest system tickets will have to work anonymously
    - I do not know exactly when we are meant to greet the user. On start up? When they contact AI servant? idk rn

- Showing events with available tickets
    - Do we give the LLM access to the database in this case? That wouldn't make much sense, thats something that
        LLMs would not be good at. I guess that the LLM booking assistant in this case would just have multiple
        aspects to itself:
            - Actual LLM connection: talks with the user / interprets command --> might have to add some sort of   
                specialized prompt that interprets whatever the user writes and communicates through defined pathways with the actual assistant service
            - Database fetch --> the assistant is going to have to retrieve and present database information
            - Ticket booking --> the assistant is going to have to alter the database in precise ways; database    
                operation still but a bit different
    - overall this one is a bit lacking in nuance (well... this entire service is, I'm not entirely sure how I
        am meant to visualize the end product)

- Showing the chatbot is going to book a specific ticket --> I did not know how visual this was meant to be
    I suppose the the exposed endpoint is accessible and acts as a ferry between the user and the LLM gateway
    in the backend. Other than that, this one is pretty simple

- Ask for confirmation of the event and the ticket --> trivial, see above

- Confirming that the ticket is booked --> trivial, see above


# Details --> From rubric

## Endpoint: /api/llm/parse
* I am still not sure if this service has its own backend + open port? It should.

### Post -> should take text "Book two tickets for Jazz Night" for example...


I have a few LLM services that we can use:
- GPT-4o-Mini
- Ollama + Llama 3 (this would include stuff like DeepSeek)
This part doesn't rly matter

This will return a structured json response that describes the prompt --> matches what I was talking about (predefined guiderails)