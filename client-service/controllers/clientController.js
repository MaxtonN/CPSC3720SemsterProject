const { getEvents } = require('../models/clientModel');
const listEvents = (req, res) => {
const events = getEvents();
res.json(events);
};
module.exports = { listEvents };