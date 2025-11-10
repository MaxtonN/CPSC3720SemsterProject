const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetDB } = require('../controllers/authController');

// endpoints 
router.post('/register', registerUser); 
router.post('/login', loginUser);

// temp endpoint for testing:
router.delete('/database-reset', resetDB);

module.exports = router;