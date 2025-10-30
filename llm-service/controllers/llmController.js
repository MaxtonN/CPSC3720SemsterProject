const { Parse, Booking, BookingList } = require('../models/llmModel');


/* 
 * controller for Parse; validates message and then sends to llm to get parsed. Processes and verifies the llm response
 *
 * req.body.message -> string, message that will be passed to the llm
 * 
 * returns (through res) -> json object, contains the user intent (book), event, and ticket_count; if llm cannot parse text
 *      a error message will be sent
 */
const parseText = async (req, res) => {
    if(!req.body || !req.body.message){
        res.status(400).send("Bad Request: No Message/Body");
        return;
    }

    try{
        // if the parsing fails I could try and repeat the Parse() to hope that the llm gets it right the next time
        const response = await Parse(req.body.message);
        const parsedInformation = JSON.parse(response);
        if(!parsedInformation.intent || !parsedInformation.ticketAmount || !parsedInformation.event){
            res.status(500).send("Internal Server Error: LLM response failure");
        }
        else{
            res.status(200).json(parsedInformation);
        }
    }
    catch(error){
        res.status(500).send("Internal Server Error: Unknown");
    }
};

/*
 * Adds a booking to the bookings table in the shared-db database
 *
 * req.body.user -> (OPTIONAL) string, the name of the user who is booking the ticket(s)
 * res.body.event -> (REQUIRED) string, the name of the event the user is booking for
 * res.body.ticket_count -> (REQUIRED) integer, the amount of tickets the user is booking
 * 
 * returns: json object, status of the SQL operation
 */
const addBooking = async (req, res) => {

};

/*
 * Gets all bookings from the bookings table in the shared-db database
 *
 * returns: json object, all rows in the bookings table
 */
const getBookings = async (req, res) => {

}

module.exports = { parseText };