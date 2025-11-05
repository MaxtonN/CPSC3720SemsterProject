const { Parse } = require('../models/llmModel');
const WordsToNumbers = require('words-to-numbers');

/*
 * Takes in a message and parses according to predefined keywords and common commands. Accounts for the following commands:
 *  - Buy <ticket_amount> ticket(s) for <event_name>
 *  - Book <ticket_amount> ticket(s) for <event_name>
 *  - Purchase <ticket_amount> ticket(s) for <event_name>
 * If none of these can be detected, then return null. There is some leeway so the action verb is case insensitive and
 * the event name can start at the 4th or 5th word as long as the word "for" is used.
 * 
 * message -> string, message that will be parsed
 * 
 * return: json object, holds the event_name, intent, and ticket amount. If parsing fails returns null.
 */
const keywordParse = (message) => {
    const wordlist = message.split(' ');

    // minimum amount of words; message must at least have an actionverb, ticket_amount, "for", and event name.
    if(wordlist.length < 4){
        return null;
    }

    let response = JSON.parse('{"intent":"","ticket_amount":0, "event_name":""}');

    // checking for intent
    const actionVerb = wordlist[0].toLowerCase();
    if(actionVerb == "buy" || actionVerb == "purchase" || actionVerb == "book"){
        response.intent = "book";
    }
    else{
        console.log("No valid action verb found", actionVerb);
        return null;
    }

    // checking for ticket_amount
    let ticketAmount = parseInt(wordlist[1]);
    if(isNaN(ticketAmount)){
        ticketAmount = WordsToNumbers.wordsToNumbers(wordlist[1]);
    }

    if(isNaN(ticketAmount) || ticketAmount <= 0){
        console.log("No valid ticket amount found");
        return null;
    }
    else{
        response.ticket_amount = ticketAmount;
    }

    // checking for event_name
    let start;
    if(wordlist[2].toLowerCase() == "for")
        start = 3;
    else if(wordlist[3].toLowerCase() == "for")
        start = 4;
    else
        return null;

    // no event name was given
    if(start === 4 && wordlist.length == 4){
        return null;
    }

    const eventNameArr = wordlist.slice(start, wordlist.length);
    const eventName = eventNameArr.join(" ");
    response.event_name = eventName;

    return response;
};

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
        // tries llm parsing a maximum of two times to improve reliability
        let parsedInformation = JSON.parse('{"intent":null, "ticket_amount":null, "event_name":null}');
        let counter = 2;
        while((!parsedInformation || !parsedInformation.intent || !parsedInformation.ticket_amount || !parsedInformation.event_name) && counter > 0){
            const response = await Parse(req.body.message);
            try{
                parsedInformation = JSON.parse(response);
            }
            catch(error){
                console.log("Error parsing LLM response:", error);
                console.log("LLM response was:", response);
            }
            counter = counter - 1;
        }

        if(!parsedInformation || !parsedInformation.intent || !parsedInformation.ticket_amount || !parsedInformation.event_name){
            console.log("Message could not be parsed by llm");
        }
        else{
            res.status(200).json(parsedInformation);
            return;
        }

        // llm failed; try keyword-based parser
        parsedInformation = keywordParse(req.body.message);
        if(!parsedInformation){
            res.status(400).json({error: "Bad Request: Message could not be parsed"});
        }
        else{
            res.status(200).json(parsedInformation);
        }

    }
    catch(error){
        console.log(error);
        res.status(500).send({error: "Internal Server Error: Unknown"});
    }
};



module.exports = { parseText };