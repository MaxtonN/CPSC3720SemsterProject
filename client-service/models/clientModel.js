const Database = require("better-sqlite3");
const databaseFilePath = "../backend/shared-db/database.sqlite";


// get row by ID, eventID is not null, returns requested row or null
const getEvent = (eventId) => {
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

// get all rows from shared-db, event table, returns all rows
const getEvents = () => {
    const database = new Database(databaseFilePath);

    const statement = database.prepare("SELECT * FROM events");
    const rows = statement.all();
    database.close();

    return rows;
};

// decrement event ticket count, count should always be one, assumes a non-null eventID, returns a statusNumber and message
const decrementTickets = (eventId) => {
    let statusNumber = 201;
    let message = 'Success';

    // validating eventId, must already exist in table
    const row = getEvent(eventId);
    if(!row){
        statusNumber = 400;
        message = `Bad Request: Event with id: ${eventId} could not be found`;
        return [statusNumber, message];
    }

    // validating purchase, there must be tickets remaining
    if(row.available_tickets == 0){
        statusNumber = 400;
        message = `Bad Request: Cannot purchase ticket for sold out event`;
        return [statusNumber, message];
    }
    
    let info;
    try{
        // lock down the database while making changes to prevent race conditions and corruption
        const database = new Database(databaseFilePath);
        info = database.exec(`
            BEGIN EXCLUSIVE; 
            UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ${eventId} AND available_tickets >= 1; 
            COMMIT;`
        );
        database.close();
    }
    catch{
        statusNumber = 500;
        message = 'Internal server error: Unknown error occured';
    }

    if(!info){
        statusNumber = 500;
        message = 'Internal server error: Database SQL script failure';
    }

    return [statusNumber, message];
};

module.exports = { getEvents, decrementTickets };