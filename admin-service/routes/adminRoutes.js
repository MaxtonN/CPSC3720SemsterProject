const express = require('express');
const router = express.Router();
const { listEvents, addEvent } = require('../controllers/adminController');

router.get('/events', listEvents); // return list of events for get request to /api/events
router.post('/events', addEvent); // add an event for post request to /api/events
module.exports = router; // export the router that is used by the server.js file to handle /api endpoint