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
        res.status(500).send("Internal Server Error: Unknown Exception");
    else
        res.status(200).json(events).send("Success");
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
        res.status(400).send('Bad Request: No event ID provided');
        return;
    }

    // validating eventId, must already exist in table
    const row = await getEvent(eventId);
    if(!row){
        res.status(400).send(`Bad Request: Event with id: ${eventId} could not be found`);
        return;
    }

    // validating purchase, there must be tickets remaining
    if(row.available_tickets == 0){
        res.status(400).send(`Bad Request: Cannot purchase ticket for sold out event`);
        return;
    }

    // decrement tickets and send response
    try{
        let info = await decrementTickets(req.params.id);
        if(!info){
            res.status(500).send("Internal Server Error: SQL script failure");
            return;
        }
    }
    catch{
        res.status(500).send("Internal Server Error: Unknown Exception");
        return;
    }
    
    res.status(200).send("Success");
};

module.exports = { listEvents, purchaseTicket };