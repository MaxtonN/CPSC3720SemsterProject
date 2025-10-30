const express = require('express');
const router = express.Router();
const { parseText, addBooking, getBookings } = require('../controllers/llmController');

// endpoints 
router.post('/llm/parse', parseText);
router.post('/llm/book', addBooking);
router.get('/llm/bookings', getBookings);

module.exports = router;