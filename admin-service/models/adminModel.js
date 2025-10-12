const Database = require("better-sqlite3");
const dbFilePath = "../backend/shared-db/database.sqlite";

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
    // lock down the datbase while making changes to prevent race conditions and corruption
    const db = new Database(dbFilePath);
    const info = db.exec(`
        BEGIN EXCLUSIVE;
        INSERT INTO events (name, date, available_tickets) VALUES (?, ?, ?);
        COMMIT;`
    );
    db.close();
    
    return info;
};

module.exports = { getEvents, postEvent };