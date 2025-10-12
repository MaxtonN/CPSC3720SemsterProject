const Database = require("better-sqlite3");
const dbFilePath = "../backend/shared-db/database.sqlite";

// get data from shared-db
const getEvents = () => {
    const db = new Database(dbFilePath);
    const stmt = db.prepare("SELECT id, name, date, available_tickets FROM events");
    const rows = stmt.all();
    db.close();

    return rows;
};

// decrement event ticket count, count should always be one
const decrementTickets = (eventId) => {
    const db = new Database(dbFilePath);
    const stmt = db.prepare("UPDATE events SET available_tickets = available_tickets - 1 WHERE id = ? AND available_tickets >= 1");
    const info = stmt.run(eventId);
    db.close();
    return info;
};

module.exports = { getEvents, decrementTickets };