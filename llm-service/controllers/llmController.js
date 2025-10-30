const { Parse } = require('../models/llmModel');



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
}

module.exports = { parseText };