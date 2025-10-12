const Database = require("better-sqlite3");
const databaseFilePath = "../backend/shared-db/database.sqlite";


// get row by ID
const getEvent = (eventId) => {
    const database = new Database(databaseFilePath);
    
    const statement = database.prepare("SELECT id, name, date, available_tickets FROM events WHERE id = ?"); // get row with matching id
    const row = statement.all(eventId);
    database.close();

    // only returning element, not array with one element
    return row[0];
}

// get data from shared-db
const getEvents = () => {
    const database = new Database(databaseFilePath);

    const statement = database.prepare("SELECT id, name, date, available_tickets FROM events");
    const rows = statement.all();
    database.close();

    return rows;
};

// decrement event ticket count, count should always be one, assumes a non-null eventID, returns a statusNumber and message
const decrementTickets = (eventId) => {
    let statusNumber = 500;
    let message = 'Internal Server Error';

    // validating eventId, must already exist in table
    const rows = getEvents();
    for(let i = 0; i < rows.length; i++){
        if(rows[i].id == eventId)
            break;
        if(i == rows.length - 1){
            statusNumber = 404;
            message = `Not Found: Event with id: ${eventId} could not be found`;
            return [statusNumber, message];
        }
    }

    // there must be tickets remaining
    const row = getEvent(eventId);
    if(row.available_tickets == 0){
        statusNumber = 403;
        message = `Forbidden: Cannot purchase ticket for sold out event`;
        return [statusNumber, message];
    }


    
    // lock down the database while we do this to prevent race conditions and corruption
    const database = new Database(databaseFilePath);
    const info = database.exec(`
        BEGIN EXCLUSIVE; 
        UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ${eventId} AND available_tickets >= 1; 
        COMMIT;`
    );
    database.close();

    statusNumber = 201;
    message = "Success";

    return [statusNumber, message];
};

module.exports = { getEvents, decrementTickets };