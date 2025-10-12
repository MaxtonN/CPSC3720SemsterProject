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

    const [statusNumber, message] = decrementTickets(req.params.id);
    res.status(statusNumber).send(message);
};

module.exports = { listEvents, purchaseTicket };