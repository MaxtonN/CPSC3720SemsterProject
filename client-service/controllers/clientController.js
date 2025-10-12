const { getEvents, decrementTickets } = require('../models/clientModel');
const listEvents = (req, res) => {
    const events = getEvents();
    res.json(events);
};

const purchaseTicket = (req, res) => {

    // validate input
    if(!req || !req.params || !req.params.id) {
        res.status(400).send('Bad Request: No event ID provided');
        return;
    }

    const eventId = req.params.id;
    // find the event by its ID to track its name
    const events = getEvents();
    const event = events.find(e => e.id == eventId); 

    // decrement tickets and send response
    const [statusNumber, message] = decrementTickets(req.params.id);

    if (event) {
        console.log(`Successfully purchased ticket for event: ${event.name}`);
    } else {
        console.log(`Unknown Event ${eventId}`);
    }

    res.status(statusNumber).send(message);
};

module.exports = { listEvents, purchaseTicket };