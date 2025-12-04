const express = require('express');
const router = express.Router();
const { parseText, addBooking, getBookings } = require('../controllers/llmController');

// endpoints 
router.post('/llm/parse', parseText);

module.exports = router;