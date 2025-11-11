const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetDB } = require('../controllers/authController');
const jwt = require('jsonwebtoken');

// endpoints 
router.post('/register', registerUser); 
router.post('/login', loginUser);

// temp endpoints for testing:
router.delete('/database-reset', resetDB);
router.get('/token-route', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        res.status(200).json({ message: "Token is valid", user: decoded });
    });
});

module.exports = router;