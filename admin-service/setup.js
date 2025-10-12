// ig this file is to setup a test database for the admin service, Ill use it for testing purposes for now

//curl.exe -X POST -H "Content-Type: application/json" -d '{\"id\":4,\"name\":\"Example\",\"date\":\"2025-09-01\"}' http://localhost:5001/api/events

const fs =  require("fs");
const Database = require("better-sqlite3");

const databasePath = "../backend/shared-db/database.sqlite";
const sqlScriptPath = "../backend/shared-db/init.sql";

const db = new Database(databasePath);
db.exec(fs.readFileSync(sqlScriptPath, "utf-8"));
console.log("Database initialized.");