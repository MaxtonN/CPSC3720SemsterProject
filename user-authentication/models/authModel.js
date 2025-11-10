const path = require("path");
const Database = require("better-sqlite3");

// Use absolute path in order to find the database correctly
const dbFilePath = path.join(__dirname, "../../backend/shared-db/database.sqlite");

// cannot store plain text passwords, 


/* * AddUser adds a new user based on given information into the shared
 * SQLite database
 * username -> string, username of the new user
 * email -> string, email of the new user
 * password -> string, password of the new user (should be hashed)
 */
const AddUser = (username, email, password) => {
    const db = new Database(dbFilePath);
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    const result = stmt.run(username, email, password);
    db.close();
    return result;
};

/* * AuthenticateUser authenticates a user based on given email and password
 * in the shared SQLite database
 * email -> string, email of the user to authenticate
 * password -> string, password of the user to authenticate (should be hashed)
 */
const AuthenticateUser = (email, password) => {
    const db = new Database(dbFilePath);
    const stmt = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    const user = stmt.get(email, password);
    db.close();
    return user;
};

module.exports = { AddUser, AuthenticateUser };