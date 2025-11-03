const request = require('supertest');
const fs = require('fs');
const Database = require('better-sqlite3');
const app = require('../server');

// optional setup before running tests
beforeAll(() => {
   // reinitialize database before tests
   const dbPath = '../../backend/shared-db/database.sqlite';
   const sqlPath = '../../backend/shared-db/init.sql';
   // testing paths
   console.log("DB Path:", __dirname + "/" + dbPath);
   console.log("SQL Path:", __dirname + "/" + sqlPath);

   // initialize the database
   const db = new Database(__dirname + "/" + dbPath);
   const sql = fs.readFileSync(__dirname + "/" + sqlPath, 'utf-8');

   db.exec(sql);
   db.close();
});

describe('Admin Microservice API', () => {

  test('POST /api/admin/events should add a valid event', async () => {
    const event = {
      name: "Jazz Night",
      date: "2030-05-20",
      available_tickets: 50
    };

   const res = await request(app)
      .post('/api/admin/events')
      .send(event);

    console.log("Response:", res.statusCode, res.text); // debug print
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Success/i);
  });

});