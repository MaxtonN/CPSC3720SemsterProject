const Database = require("better-sqlite3");
//const databaseFilePath = "shared-db/database.sqlite";
const path = require("path");
const databaseFilePath = path.join(__dirname, '..', 'shared-db', 'database.sqlite');
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
const RetrieveEventRowByID = async (eventId) => {
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
 * retrievens all events in the shared database with the given name
 *
 * eventName -> string, name of the event to search for
 * 
 * return: list, list of event objects with the given name, empty list if none found
 */
const RetrieveEventRowsByName = async (eventName) => {
    const database = new Database(databaseFilePath);
    const statement = database.prepare("SELECT * FROM events WHERE name = ?"); // get row with matching name
    const rows = statement.all(eventName);
    database.close();

    return rows;
}

/*
 * getEvents retrieves and returns the rows from the events table in the shared database (database.sqlite)
 * 
 * return:
 *  - list, list of all events in the shared database
 */
const RetrieveEventRows = async () => {
    const database = new Database(databaseFilePath);

    const statement = database.prepare("SELECT * FROM events");
    const rows = statement.all();
    database.close();

    return rows;
};

/*
 * retrieves all events matching the given query parameters
 * 
 * availableTickets -> boolean, if true, only events where available_tickets > 0 are returned
 * 
 * return: json object, list of all events matching the query parameters
 */
const RetrieveEventRowsQuery = async (query) => {
    const database = new Database(databaseFilePath);
    const statement = database.prepare(`SELECT * FROM events WHERE ${query}`);
    const rows = statement.all();
    database.close();

    return rows;
}

/*
 * decrementTickets reduces the amount 'available_tickets' refered to by the eventID by the given amount.
 *
 * eventId -> int, must already exist in the table, must not be null, event refered to must not be sold out
 * amount -> int, amount to decrement available_tickets by, must be > 0
 *
 * return: object, returns the result of SQL script execution
 * 
 */
const DecreaseAvailableTickets = async (eventId, amount) => {   
    // lock down the database while making changes to prevent race conditions and corruption
    const database = new Database(databaseFilePath);
    const info = database.exec(`
        BEGIN EXCLUSIVE; 
        UPDATE events SET available_tickets = available_tickets - ${amount} WHERE id = ${eventId} AND available_tickets >= ${amount}; 
        COMMIT;`
    );
    database.close();
    
    return info;
};


/*
 * Adds a booking to the shared-database in the bookings table
 *
 * booking -> json object, should have a field for:
 *      event_name -> (REQUIRED) string, name of the event
 *      ticket_count -> (REQUIRED) integer, number of booked tickets
 *      user -> (OPTIONAL, defauls to 'guest') string, name of the user who is booking the ticketss
 * 
 * returns: json object, database reply
 */
const AddBookingRow = async (booking) => {
    const database = new Database(databaseFilePath);
    
    // allows the user field to be blank
    if(booking.user){
        // lock down database while making changes to prevent race conditions
        const purchase = database.transaction((booking) => {
            const statement = database.prepare("INSERT INTO bookings (event_name, user, ticket_count) VALUES (?, ?, ?)");
            return statement.run(booking.event_name, booking.user, booking.ticket_count);
        });
        const response = purchase(booking);
        database.close();

        return response;
    }
    else{
        // lock down database while making changes to prevent race conditions
        const purchase = database.transaction((booking) => {
            const statement = database.prepare("INSERT INTO bookings (event_name, ticket_count) VALUES (?, ?)");
            return statement.run(booking.event_name, booking.ticket_count);
        });
        const response = purchase(booking);
        database.close();

        return response;
    }
}

/* 
 * Retrieves all bookings from the bookings table in the shared-db database
 *
 * return: json object, reprsentation of every row in the bookings table
 */
const RetrieveBookingRows = async () => {
    const database = new Database(databaseFilePath);

    const statement = database.prepare("SELECT * FROM bookings");
    const rows = statement.all();

    return rows;
}

module.exports = { RetrieveEventRowByID, RetrieveEventRowsByName, RetrieveEventRows, DecreaseAvailableTickets, AddBookingRow, RetrieveBookingRows, RetrieveEventRowsQuery };