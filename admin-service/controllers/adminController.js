const { getEvents } = require('../models/adminModel');
const listEvents = (req, res) => {
const events = getEvents();
res.json(events);
};
module.exports = { listEvents };