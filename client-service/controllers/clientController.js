const { getEvents, getEvent, decrementTickets } = require('../models/clientModel');
const { Mutex } = require('async-mutex');

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

    // validate event existence
    const row = await getEvent(req.params.id);
    if(!row){
        await res.status(400).send(`Bad Request: Event with id: ${req.params.id} could not be found`);
        return;
    }

    // need to lock the following critical section, otherwise available_tickets could become 0 between checking and calling decrementTickets()
    // event must have available tickets
    const mutex = new Mutex();
    const release = await mutex.acquire();
    if(row.available_tickets == 0){
        await res.status(400).send(`Bad Request: Cannot purchase ticket for sold out event`);
        return;
    }
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
    release();
    
    await res.status(200).send("Success");
};

module.exports = { listEvents, purchaseTicket };