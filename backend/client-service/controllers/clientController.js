const { RetrieveEventRowByID, RetrieveEventRowsByName,RetrieveEventRows, RetrieveEventRowsQuery, DecreaseAvailableTickets, AddBookingRow, RetrieveBookingRows } = require('../models/clientModel');
const { Mutex } = require('async-mutex');

/*
 * returns a list of all events, wrapper for getEvents
 * 
 * req -> object, api request
 * res -> object, api response
 */
const getEvents = async (req, res) => {
    const events = await RetrieveEventRows();
    if(!events)
        await res.status(500).send("Internal Server Error: Unknown Exception");
    else
        await res.status(200).json(events);
};

/*
 * returns a list of all events matching the given query parameters
 *
 * req -> object, api request
 * res -> object, api response
*/
const getEventsQuery = async (req, res) => {
    // construcing query string for database sql query statement
    let queryList = [];
    if(req.query && req.query.available_tickets){
        queryList.push(`available_tickets > ${req.query.available_tickets}`);
    }
    if(req.query && req.query.before_date){
        queryList.push(`date < '${req.query.before_date}'`);
    }
    if(req.query && req.query.after_date){
        queryList.push(`date > '${req.query.after_date}'`);
    }
    const query = queryList.join(" AND ");

    if(query === ""){
        await res.status(400).json({error: "Bad Request: No query parameters provided"});
        return;
    }


    try{
        const events = await RetrieveEventRowsQuery(query);
        if(!events){
            await res.status(500).json({error: "Internal Server Error: Unknown"});
        }
        else{
            await res.status(200).json(events);
        }
    }
    catch(error){
        await res.status(500).json({error: "Internal Server Error: Unknown"});
    }
}

/*
 * simulates the purchase of a ticket for an event, wrapper for decrementTickets(...)
 * does all required error checking
 * 
 * req -> object, api request
 * res -> object, api response
 */
const purchaseTickets = async (req, res) => {
    // validate request
    if(!req || !req.params || !req.params.id) {
        await res.status(400).json({error: 'Bad Request: No event ID provided'});
        return;
    }
    if(isNaN(req.body.ticket_amount)) {
        await res.status(400).json({error: 'Bad Request: Invalid ticket amount'});
        return;
    }

    // validate event existence
    const row = await RetrieveEventRowByID(req.params.id);
    if(!row){
        await res.status(400).json({error: `Bad Request: Event with id: ${req.params.id} could not be found`});
        return;
    }

    // need to lock the following critical section, otherwise available_tickets could become 0 between checking and calling decrementTickets()
    // event must have available tickets
    const mutex = new Mutex();
    const release = await mutex.acquire();
    if(row.available_tickets == 0){
        await res.status(400).json({error: `Bad Request: Cannot purchase ticket for sold out event`});
        return;
    }

    try{
        let info = await DecreaseAvailableTickets(req.params.id, req.body.ticket_amount);
        if(!info){
            await res.status(500).json({error: "Internal Server Error: SQL script failure"});
            return;
        }
    }
    catch{
        await res.status(500).json({error: "Internal Server Error: Unknown Exception"});
        return;
    }
    release();

    await res.status(200).json({message: "Success"});
};

/*
 * Adds a booking to the bookings table in the shared-db database
 *
 * req.body.user -> (OPTIONAL) string, the name of the user who is booking the ticket(s)
 * res.body.event -> (REQUIRED) string, the name of the event the user is booking for
 * res.body.ticket_count -> (REQUIRED) integer, the amount of tickets the user is booking
 * 
 * returns: json object, status of the SQL operation
 */
const addBooking = async (req, res) => {
    if(!req.body.event_name || !req.body.ticket_count){
        res.status(400).json({error: "Bad Request: Missing body information"});
        return;
    }

    try{
        const response = await AddBookingRow(req.body);
        if(response){
            res.status(200).json(response);
        }
        else{
            res.status(500).json({error: "Internal Server Error: Unknown"});
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error: Unknown"});
    }
};

/*
 * Gets all bookings from the bookings table in the shared-db database
 *
 * returns: json object, all rows in the bookings table
 */
const getBookings = async (req, res) => {

    try{
        const response = await RetrieveBookingRows();
        if(response){
            res.status(200).json(response);
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json("Internal Server Error: Unknown");
    }
}


/* 
 * Gets all events that match the provided name from the shared-db database
 * 
 * returns: json object, every row in the events table that match the given name
 */
const getEventByName = async (req, res) => {
    if(!req || !req.params || !req.params.name) {
        await res.status(400).send('Bad Request: No event name provided');
        return;
    }

    try{
        const response = await RetrieveEventRowsByName(req.params.name);
        
        if(response && response.length === 0){
            res.status(404).json({error: `Not Found: No events found with name: ${req.params.name}`});
            return;
        }
        else if(response){
            res.status(200).json(response[0]);
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json("Internal Server Error: Unknown");
    }
}

module.exports = { getEvents, purchaseTickets, addBooking, getBookings, getEventByName, getEventsQuery };