const express = require('express');
const router = express.Router();
const { addEvent } = require('../controllers/adminController');

// endpoints 
router.post('/admin/events', addEvent); 

module.exports = router; 