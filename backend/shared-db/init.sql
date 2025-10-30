
-- Drop table if it exists
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS bookings;

-- SQL script to initialize the database schema for events
CREATE TABLE events(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date DATETIME NOT NULL,
    available_tickets INTEGER NOT NULL
);

CREATE TABLE bookings(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    user TEXT DEFAULT "Guest",
    ticket_count INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- seed events
INSERT INTO events (name, date, available_tickets) VALUES
('Concert A', '2024-09-15 20:00:00', 100),
('Theater B', '2024-10-01 19:30:00', 50),
('Festival C', '2024-11-20 12:00:00', 200);

-- seed bookings
INSERT INTO bookings (event_name, ticket_count) VALUES
('Jazz Night', 5),
('Fun Festival', 2),
('Study Group', 1);