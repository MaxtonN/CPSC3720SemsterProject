const express = require('express');
const router = express.Router();
const { parseText } = require('../controllers/llmController');

// endpoints 
router.post('/api/llm/parse'); 
 module.exports = router;