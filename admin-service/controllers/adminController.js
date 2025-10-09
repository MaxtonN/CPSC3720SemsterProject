const { getEvents, postEvent } = require('../models/adminModel');

// function to list events
const listEvents = (req, res) => {
    const events = getEvents();
    res.json(events);
};

// function to add an event
const addEvent = (req, res) => {
    postEvent(req.body); // add event to the model
    res.status(201).send('Event added');
}
module.exports = { listEvents, addEvent };