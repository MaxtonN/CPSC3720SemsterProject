//import OpenAI from "openai";
const OpenAI = require("openai");
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
    Respond to every prompt in json with the keys 'intent', 'ticket_amount', and 'event_name'. If it seems like the user wants to buy/purchase/book a ticket 'intent' should be 'book'. If the user does not seem to want to book tickets, return null.
    'ticket_amount' should be an integer representing the amount of tickets the user wants to book. 'event_name' should be a string representing the name of the event the user wants to book tickets for.
    Do not include any extra information in your response, only the json object. All responses should be in the following format:
    {
        "intent": "book",
        "ticket_amount": 2,
        "event_name": "Coldplay Concert"
    }`;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt},
            { role: "user", content: message }
        ]
    });

    return response.choices[0].message.content;
}


module.exports = { Parse };