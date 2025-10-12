const express = require('express');
const router = express.Router();
const { listEvents, purchaseTicket } = require('../controllers/clientController');
router.get('/events', listEvents);

// purchase a ticket, always decrement by 1 for now, :id = 4 right now for testing
router.post('/events/:id/purchase', purchaseTicket);
module.exports = router;