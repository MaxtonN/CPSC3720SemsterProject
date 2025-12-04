// Import modules for testing and simulating API requests
const request = require('supertest');
const fs = require('fs');
const Database = require('better-sqlite3');
const app = require('../server');

// Before running any tests, reset the shared database to a clean state
beforeAll(() => {
  const dbPath = '../../backend/shared-db/database.sqlite';
  const sqlPath = '../../backend/shared-db/init.sql';

  const db = new Database(__dirname + '/' + dbPath);
  const sql = fs.readFileSync(__dirname + '/' + sqlPath, 'utf-8');

  db.exec(sql);
  db.close();
});

// Tests for the client-service endpoints
describe('Client Microservice API', () => {

  // Test GET /api/events returns all events in the database
  test('GET /api/events should return all events', async () => {
    const res = await request(app).get('/api/events');

    // A return request status of 200 
    expect(res.statusCode).toBe(200);

    // The response should be an array of event objects
    expect(Array.isArray(res.body)).toBe(true);

    // Each event should have specific fields
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('date');
      expect(res.body[0]).toHaveProperty('available_tickets');
    }
  });

  // Test purchasing a ticket decreases available tickets
  test('POST /api/events/:id/purchase should decrement available tickets', async () => {
    // gets an event from the database to test with
    const eventsRes = await request(app).get('/api/events');
    const event = eventsRes.body[0];

    // Make sure the event exists
    expect(event).toBeDefined();

    // Save current ticket count
    const previousCount = event.available_tickets;

    // Attempt to purchase one ticket
    const res = await request(app)
      .post(`/api/events/${event.id}/purchase`)
      .send({ ticket_amount: 1 }); 
    // request will result in a 200 message
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Success/i);

    // Verify ticket count decreased
    const afterRes = await request(app).get(`/api/events`);
    const updatedEvent = afterRes.body.find(e => e.id === event.id);
    expect(updatedEvent.available_tickets).toBe(previousCount - 1);
  });

  // Test purchasing for an invalid event ID
  test('POST /api/events/:id/purchase should fail for invalid event ID', async () => {
    // tries to purchase a ticket for a non-existent event
    const res = await request(app)
      .post('/api/events/999/purchase')
      .send({ ticket_amount: 1 });
    // should return a 400 bad request error and say event cannot be found
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/could not be found/i);
  });

  // Test adding a booking to the bookings table
  test('POST /api/book should add a new booking', async () => {
    const booking = {
      event_name: "Dance Night",
      ticket_count: 2,
      user: "TestUser"
    };
    // sends request to add the event
    const res = await request(app)
      .post('/api/book')
      .send(booking);

    expect(res.statusCode).toBe(200);
  });

  // test to retrieve all booking from events table
  test('GET /api/bookings should return all bookings', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // test to get event by name
  test('GET /api/events/name/:name should return event by name', async () => {
    const eventName = "Concert A";
    const res = await request(app).get(`/api/events/name/${encodeURIComponent(eventName)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(eventName);
  });

  // test to get event by name that does not exist
  test('GET /api/events/name/:name should return 404 for non-existent event', async () => {
    const eventName = "NonExistentEvent";
    const res = await request(app).get(`/api/events/name/${encodeURIComponent(eventName)}`);
    expect(res.statusCode).toBe(404);
  });

  // test to get events based on query parameters after_date, before_date, availableTickets together
  test('GET /api/events/query should return events based on query parameters', async () => {
    const res = await request(app).get('/api/events/query?after_date=2025-12-20&before_date=2025-12-20&available_tickets=true');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(event => {
      expect(event.date).toBe('2025-12-20');
    });
  });

  // test to get events based on query parameters with no parameters provided
  test('GET /api/events/query should return 400 if no query parameters provided', async () => {
    const res = await request(app).get('/api/events/query');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/No query parameters provided/i);
  });

  // test query with only available_tickets parameter
  test('GET /api/events/query with only available_tickets parameter', async () => {
    const res = await request(app).get('/api/events/query?available_tickets=1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(event => {
      expect(event.available_tickets).toBeGreaterThan(0);
    });
  });

  // test query with only date range parameters
  test('GET /api/events/query with only date range parameters', async () => {
    const res = await request(app).get('/api/events/query?after_date=2025-12-19&before_date=2025-12-21');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(event => {
      expect(new Date(event.date) >= new Date('2025-12-19')).toBe(true);
      expect(new Date(event.date) <= new Date('2025-12-21')).toBe(true);
    });
  });

  // test query with only after_date parameter
  test('GET /api/events/query with only after_date parameter', async () => {
    const res = await request(app).get('/api/events/query?after_date=2025-12-20');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(event => {
      expect(new Date(event.date) > new Date('2025-12-20')).toBe(true);
    });
  });

  // test query with only before_date parameter
  test('GET /api/events/query with only before_date parameter', async () => {
    const res = await request(app).get('/api/events/query?before_date=2025-12-20');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(event => {
      expect(new Date(event.date) < new Date('2025-12-20')).toBe(true);
    });
  });
});