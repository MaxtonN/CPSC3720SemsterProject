// Mock data for Clemson events

let events = [
    { id: 1, name: 'Clemson Football Game', date: '2025-09-01' },
    { id: 2, name: 'Campus Concert', date: '2025-09-10' },
    { id: 3, name: 'Career Fair', date: '2025-09-15' }
];

// returns list of events
const getEvents = () => {
return events;
};

// adds an event to the list
const postEvent = (event) => {
    events.push({id: event.id, name: event.name, date: event.date});
    console.log(`Event added: ${event.name} on ${event.date}`);
};

module.exports = { getEvents, postEvent };