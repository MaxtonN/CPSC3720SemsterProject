const { getEvents, decrementTickets } = require('../models/clientModel');
const listEvents = (req, res) => {
    const events = getEvents();
    res.json(events);
};

const purchaseTicket = (req, res) => {
    if(!req || !req.body || !req.body.eventId) {
        res.status(400).send('Bad Request: No event ID provided');
        return;
    }
    const eventId = req.body.eventId;
    decrementTickets(eventId); // always decrement by 1 for now

 
    res.status(200).send('Ticket purchased successfully');
};

module.exports = { listEvents, purchaseTicket };