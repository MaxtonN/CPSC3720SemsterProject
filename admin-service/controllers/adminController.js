const { getEvents, postEvent } = require('../models/adminModel');

/*
 * addEvent takes in an api POST request and creates a new entry in the
 * shared SQLite database based on given data, wrapper for postEvent
 * 
 * req -> json object, json object representation of api request
 * res -> json object, json object representation of api response
 */
const addEvent = async (req, res) => {
    // req validation
    if(!req || !req.body) {
        await res.status(400).send('Bad Request: No data provided');
        return;
    }

    // field validation, existence
    const event = req.body;
    if(!event.name){
        await res.status(400).send('Bad Request: Missing name');
        return;
    }
    else if(!event.date){
        await res.status(400).send('Bad Request: Missing date');
        return;
    }
    else if(!event.available_tickets){
        await res.status(400).send('Bad Request: Missing available_tickets');
        return;
    }

    // available_tickets validation, is a number
    if(!Number.isInteger(event.available_tickets)){
        await res.status(400).send('Bad Request: available_tickets is not an Integer');
        return;
    }

    // date validation, proper formate
    if(!Date.parse(event.date)){
        await res.status(400).send('Bad Request: Date has bad formatting');
        return;
    }

    // date validation, must be in the future
    if(Date.parse(event.date) < Date.now()){
        await res.status(400).send('Bad Request: Date is before the current day');
        return;
    }

    // execute posting
    try{
        await postEvent(event);
    }
    catch(error){
        console.log(error);
        await res.status(500).send("Internal Server Error: Unknown Exception");
        return;
    }

    await res.status(200).send("Success")
};

module.exports = { addEvent };