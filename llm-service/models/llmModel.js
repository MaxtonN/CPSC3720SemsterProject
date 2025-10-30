//import OpenAI from "openai";
const OpenAI = require("openai");
const Database = require("better-sqlite3");
const dbFilepath = "../backend/shared-db/database.sqlite";
// this is really, really bad practice but I'll just put the API_KEY here to save time
const API_KEY = "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";

/*
 * Communicates with ChatGPT API to parse text and send back the parsed information
 *
 * message -> string, message that ChatGPT will parse
 * 
 * return: string list, ChatGPT response to all queries
 */
const Parse = async (message) => {
    const client = new OpenAI({
        apiKey: API_KEY
    });

    // llm will respond according to this prompt
    const prompt = `You analyze messages and extract the intention of the user, the event the user is asking about, and the amount of tickets they want to book.
    Respond to every prompt in json with the keys 'intent', 'ticketAmount', and 'event'`;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt},
            { role: "user", content: message }
        ]
    });

    return response.choices[0].message.content;
}

/*
 * Adds a booking to the shared-database in the bookings table
 *
 * booking -> json object, should have a field for:
 *      event_name -> (REQUIRED) string, name of the event
 *      ticket_count -> (REQUIRED) integer, number of booked tickets
 *      user -> (OPTIONAL, defauls to 'guest') string, name of the user who is booking the ticketss
 * 
 * returns: json object, database reply
 */
const Booking = async (booking) => {
    const database = new Database(dbFilepath);

    // allows the user field to be blank
    if(booking.user){
        // lock down database while making changes to prevent race conditions
        const purchase = database.transaction((booking) => {
            const statement = database.prepare("INSERT INTO bookings (event_name, user, ticket_count) VALUES (?, ?, ?)");
            return statement.run(booking.event_name, booking.user, booking.ticket_count);
        });
        const response = purchase(booking);
        database.close();

        return response;
    }
    else{
        // lock down database while making changes to prevent race conditions
        const purchase = database.transaction((booking) => {
            const statement = database.prepare("INSERT INTO bookings (event_name, ticket_count) VALUES (?, ?)");
            return statement.run(booking.event_name, booking.ticket_count);
        });
        const response = purchase(booking);
        database.close();

        return response;
    }
}

/* 
 * Retrieves all bookings from the bookings table in the shared-db database
 *
 * return: json object, reprsentation of every row in the bookings table
 */
const BookingList = async () => {
    const database = new Database(dbFilepath);

    const statement = database.prepare("SELECT * FROM bookings");
    const rows = statement.all();

    return rows;
}

module.exports = { Parse, Booking, BookingList };