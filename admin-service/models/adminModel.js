// Mock data for Clemson events
const fs = require("fs");
const Database = require("better-sqlite3");

const dbFilePath = "../backend/shared-db/database.sqlite";


// Fetch all events from database, format
function fetchEvents(){
    const db = new Database(dbFilePath);
    const stmt = db.prepare("SELECT id, name, date FROM events");
    const rows = stmt.all();
    db.close();

    return rows;
}

// Add event to database, contract: event must have name, data, and ticketcount
function addEvent(event){
    const db = new Database(dbFilePath);
    const stmt = db.prepare("INSERT INTO events (name, date, available_tickets) VALUES (?, ?, ?)");
    const info = stmt.run(event.name, event.date, event.available_tickets);
    db.close();
    return info;
}

// returns list of events
const getEvents = () => {
    return fetchEvents();
};

// adds an event to the list
// event must exist,
// returns the status of the operation
const postEvent = (event) => {
    if(!event || !event.id || !event.name || !event.date) {
        return 400; // bad request
    }

    // do not allow duplicate ids, maybe change to a different status code later


    const result = addEvent(event);

    if(result.changes === 0) {
        return 500; // server error, failed to add event
    }

    return 200; // success
};

module.exports = { getEvents, postEvent };