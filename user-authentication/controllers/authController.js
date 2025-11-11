const {AddUser, AuthenticateUser, DeleteAllRows} = require('../models/authModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

/*
 * registerUser takes in an api POST request and creates a new user
 * in the shared SQLite database based on given data, wrapper for AddUser
 */
const registerUser = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = await bcryptjs.hash(req.body.password, 10);
        const user = await AddUser(username, email, password);
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/*
 * loginUser takes in an api POST request and authenticates a user
 * in the shared SQLite database based on given data, wrapper for AuthenticateUser
 * 
 * returns a JWT token if authentication is successful
*/
const loginUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await AuthenticateUser(email);
        
        if (user) {
            const isMatch = await bcryptjs.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign(
                    {
                        userId: user.id,
                        email:user.email,
                        username: user.username
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                res.status(200).json({ message: "Login successful", token });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const resetDB = async (req, res) => {
    try {
        await DeleteAllRows();
        res.status(200).json({ message: "Database reset successfully" });
    } catch (error) {
        console.error("Error resetting database:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { registerUser, loginUser, resetDB };