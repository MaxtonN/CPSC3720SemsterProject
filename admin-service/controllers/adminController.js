const { getEvents, postEvent } = require('../models/adminModel');

// function to list events
const listEvents = (req, res) => {
    const events = getEvents();
    res.json(events);
};

// function to add an event, all error handling done here (no contract)
const addEvent = (req, res) => {
    if(!req || !req.body) {
        res.status(400).send('Bad Request: No data provided');
    }
    const status = postEvent(req.body); // add event to the model
    
    switch(status) {
        case 200:
            res.status(200).send('Event added successfully');
            break;
        case 400:
            res.status(400).send('Bad Request: Invalid event data');
            break;
    }
};

module.exports = { listEvents, addEvent };