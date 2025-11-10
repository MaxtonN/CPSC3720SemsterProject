const {AddUser, AuthenticateUser} = require('../models/authModel');
const bcryptjs = require('bcryptjs');

/*
 * registerUser takes in an api POST request and creates a new user
 * in the shared SQLite database based on given data, wrapper for AddUser
 */
const registerUser = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = await bcryptjs.hash(req.body.password, 10);
        
        console.log("Hashed password for login:", password);

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
        //const { email, password } = req.body;
        const email = req.body.email;
        const password = await bcryptjs.hash(req.body.password, 10);
        console.log("Hashed password for login:", password);
        
        const user = await AuthenticateUser(email, password);
        if (user) {
            res.status(200).json({ message: "Login successful", user });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { registerUser, loginUser };