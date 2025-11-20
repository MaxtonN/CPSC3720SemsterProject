// this imports all the tools we need for testing and
// simulates sending API requests
const request = require('supertest');
const fs = require('fs');
const Database = require('better-sqlite3');
const app = require('../server');

// This reinitializes our database so we do not have to keep using SQL scripts
beforeAll(() => {
   // reinitialize database before tests
   const dbPath = '../../backend/shared-db/database.sqlite';
   const sqlPath = '../../backend/shared-db/init.sql';

   // initialize the database
   const db = new Database(__dirname + "/" + dbPath);
   const sql = fs.readFileSync(__dirname + "/" + sqlPath, 'utf-8');

   db.exec(sql);
   db.close();
});


// ----------------------------------------------------------------------//
// All the test below check critical functions like event creation, ticket
// purchasing, and booking creation
// The date must be in the future or day of to be valid, correct format (YYYY/MM/DD)
// The event must contain a date, a name, and available_tickets (integer)
describe('Admin Microservice API', () => {
  // Date must be valid and in the future or present day
  test('POST /api/admin/events should add a valid event', async () => {
    const event = {
      name: "Dance Night (test)",
      date: "2025-11-20",
      available_tickets: 50
    };

   // Sends a POST request to the /api/admin/events endpoint with the event data
   const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Success/i);
  });

  // Missing the name of the event and a 400 bad request will be sent
  test('POST /api/admin/events should fail if name is missing', async () => {
    const event = {
      date: "2025-12-01",
      available_tickets: 100
    };

    const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/Missing name/i);
  });

  // Event date is missing and a 400 bad request will be sent
  test('POST /api/admin/events should fail if date is missing', async () => {
    const event = {
      name: "Missing Date Test",
      available_tickets: 40
    };

    const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/Missing date/i);
  });

  // The number of available_tickets is missing -> event will be rejected
  test('POST /api/admin/events should fail if available_tickets is missing', async () => {
    const event = {
      name: "Ticketless Event",
      date: "2025-12-25"
    };

    const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/Missing available_tickets/i);
  });

  // Invalid ticket type checks to make sure type is an integer
  test('POST /api/admin/events should fail if available_tickets is not an integer', async () => {
    const event = {
      name: "String Tickets",
      date: "2025-12-05",
      available_tickets: "fifty" // bad data type
    };

    const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/available_tickets is not an Integer/i);
  });

  // Improper date format -> correct format (YYYY//MM/DD)
  test('POST /api/admin/events should fail if date format is invalid', async () => {
    const event = {
      name: "Bad Date Format",
      date: "13-31-2025",
      available_tickets: 10
    };

    const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/bad formatting/i);
  });

  // Date is in the past -> must be future or present day
  test('POST /api/admin/events should fail if date is in the past', async () => {
    const event = {
      name: "Old Concert",
      date: "2020-01-01",
      available_tickets: 25
    };

    const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/before the current day/i);
  });

  // 8. Checks for duplicate event (same name/date) -> do not want duplicate events
  test('POST /api/admin/events should reject duplicate event with same name/date', async () => {
    const event = {
      name: "Duplicate Check",
      date: "2025-12-15",
      available_tickets: 60
    };

    // first insert succeeds
    const res1 = await request(app).post('/api/admin/events').send(event);
    expect(res1.statusCode).toBe(200);

    // second with the same data will be rejected
    const res2 = await request(app).post('/api/admin/events').send(event);
    expect(res2.statusCode).toBeGreaterThanOrEqual(400);
  });
});