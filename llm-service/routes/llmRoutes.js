const express = require('express');
const router = express.Router();
const { parseText } = require('../controllers/llmController');

// endpoints (just one rn)
router.post('/api/llm/request'); // I don't remember the exact endpoint he wanted us to use but I'll just change ts later when I figure that part out
 module.exports = router;