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

module.exports = { Parse };