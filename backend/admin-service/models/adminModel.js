const Database = require("better-sqlite3");

// Use absolute path in order to find the database correctly
const path = require("path");
const databaseFilePath = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');

/*
 * postEvent adds a new event based on given information into the shared
 * SQLite database
 * 
 * event -> object, representation of a row in the events table of the 
 *          shared database
 * 
 * return: object, information on database operation
 */
const postEvent = async (event) => {
    try {
        // Open database connection
        const database = new Database(dbFilePath);

        // Wrap insert in transaction
        const purchase = database.transaction((event) => {
            const statement = database.prepare(
                "INSERT INTO events (name, date, available_tickets) VALUES (?, ?, ?)"
            );
            statement.run(event.name, event.date, event.available_tickets);
        });

        // Execute transaction
        purchase(event);

        // Close the DB connection
        database.close();
        
    } catch (error) {
        console.log("Error posting event:", error);
        throw error;
    }
};

module.exports = { postEvent };
