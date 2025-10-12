const { getEvents, getEvent, decrementTickets } = require('../models/clientModel');

/*
 * returns a list of all events, wrapper for getEvents
 * 
 * req -> object, api request
 * res -> object, api response
 */
const listEvents = async (req, res) => {
    const events = await getEvents();
    if(!events)
        await res.status(500).send("Internal Server Error: Unknown Exception");
    else
        await res.status(200).json(events);
};


/*
 * simulates the purchase of a ticket for an event, wrapper for decrementTickets(...)
 * does all required error checking
 * 
 * req -> object, api request
 * res -> object, api response
 */
const purchaseTicket = async (req, res) => {
    // validate request
    if(!req || !req.params || !req.params.id) {
        await res.status(400).send('Bad Request: No event ID provided');
        return;
    }

    // validating eventId, must already exist in table
    const row = await getEvent(eventId);
    if(!row){
        await res.status(400).send(`Bad Request: Event with id: ${eventId} could not be found`);
        return;
    }

    // validating purchase, there must be tickets remaining
    if(row.available_tickets == 0){
        await res.status(400).send(`Bad Request: Cannot purchase ticket for sold out event`);
        return;
    }

    // decrement tickets and send response
    try{
        let info = await decrementTickets(req.params.id);
        if(!info){
            await res.status(500).send("Internal Server Error: SQL script failure");
            return;
        }
    }
    catch{
        await res.status(500).send("Internal Server Error: Unknown Exception");
        return;
    }
    
    await res.status(200).send("Success");
};

module.exports = { listEvents, purchaseTicket };