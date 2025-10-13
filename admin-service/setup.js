// ig this file is to setup a test database for the admin service, Ill use it for testing purposes for now

//curl.exe -X POST -H "Content-Type: application/json" -d '{\"name\":\"Example\",\"date\":\"2024-09-11\", \"available_tickets\":100}' http://localhost:5001/api/admin/events
//curl.exe -X POST -H "Content-Type: application/json" -d '{\"name\":\"Example\",\"date\":\"2026-10-13\", \"available_tickets\":100}' http://localhost:5001/api/admin/events
//curl.exe -X POST -H "Content-Type: application/json" -d '{\"name\":\"Example\",\"date\":\"2026-10-14\", \"available_tickets\":\"dks\"}' http://localhost:5001/api/admin/events
//curl.exe -X POST http://localhost:6001/api/events/1/purchase
//curl.exe -X GET http://localhost:6001/api/events

const fs =  require("fs");
const Database = require("better-sqlite3");

const databasePath = "../backend/shared-db/database.sqlite";
const sqlScriptPath = "../backend/shared-db/init.sql";

const db = new Database(databasePath);
db.exec(fs.readFileSync(sqlScriptPath, "utf-8"));
console.log("Database initialized.");