const Database = require("better-sqlite3");
const databaseFilePath = "../backend/shared-db/database.sqlite";

/*
 * getEvent retrieves and returns the row indicated by eventId from the events table of the shared database (database.sqlite)
 *
 * inputs:
 *  - eventID -> integer, must not be null
 * 
 * return:
 *  - object, object representing a row in the events table, has the following elements:
 *      - id -> event id
 *      - name -> title of the event
 *      - date -> date of the event
 *      - available_tickets -> how many tickets are still available for purchase
 */
const getEvent = async (eventId) => {
    const database = new Database(databaseFilePath);
    
    const statement = database.prepare("SELECT * FROM events WHERE id = ?"); // get row with matching id
    const row = statement.all(eventId);
    database.close();

    // only returning element, not array with one element
    if(row)
        return row[0];
    else
        return null;
}


/*
 * getEvents retrieves and returns the rows from the events table in the shared database (database.sqlite)
 * 
 * return:
 *  - list, list of all events in the shared database
 */
const getEvents = async () => {
    const database = new Database(databaseFilePath);

    const statement = database.prepare("SELECT * FROM events");
    const rows = statement.all();
    database.close();

    return rows;
};

// decrement event ticket count, count should always be one, assumes a non-null eventID, returns a statusNumber and message

/*
 * decrementTickets reduces the amount 'available_tickets' refered to by the eventID by one. 
 *
 * eventId -> int, must already exist in the table, must not be null, event refered to must not be sold out
 *
 * return: object, returns the result of SQL script execution
 * 
 */
const decrementTickets = async (eventId) => {   
    // lock down the database while making changes to prevent race conditions and corruption
    const database = new Database(databaseFilePath);
    const info = database.exec(`
        BEGIN EXCLUSIVE; 
        UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ${eventId} AND available_tickets >= 1; 
        COMMIT;`
    );
    database.close();
    
    return info;
};

module.exports = { getEvents, getEvent, decrementTickets };