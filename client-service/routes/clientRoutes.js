const express = require('express');
const router = express.Router();
const { getEvents, purchaseTickets, addBooking, getBookings, getEventByName, getEventsQuery } = require('../controllers/clientController');

// endpoints
router.get('/events', getEvents);
router.post('/events/:id/purchase', purchaseTickets);
router.post('/book', addBooking);
router.get('/bookings', getBookings);
router.get('/events/name/:name', getEventByName);
router.get('/events/query', getEventsQuery);

module.exports = router;