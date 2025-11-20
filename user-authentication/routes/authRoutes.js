const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetDB } = require('../controllers/authController');
const jwt = require('jsonwebtoken');

// JWT verification middleware
function verifyToken(req, res, next) {
  const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }  
    req.user = decoded;
    next();
  });
 }
}

// endpoints 
router.post('/register', registerUser); 
router.post('/login', loginUser);

// protected route
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Access granted to protected route",
    user: req.user
  });
});

router.delete('/database-reset', resetDB);
module.exports = router;