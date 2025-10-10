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
// event must exist,
// returns the status of the operation
const postEvent = (event) => {
    if(!event.id || !event.name || !event.date) {
        return 400; // bad request
    }

    // do not allow duplicate ids, maybe change to a different status code later
    if(events.find(e => e.id === event.id)) {
        return 400; // bad request, event with same id exists
    }

    if(!events.push(event)) {
        return 501; // server error, failed to add event
    }

    return 200; // success
};

module.exports = { getEvents, postEvent };