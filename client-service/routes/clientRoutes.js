const express = require('express');
const router = express.Router();
const { getEvents, purchaseTicket, addBooking, getBookings } = require('../controllers/clientController');

// endpoints
router.get('/events', getEvents);
router.post('/events/:id/purchase', purchaseTicket);
router.post('/book/:id', addBooking);
router.get('/bookings', getBookings);

module.exports = router;