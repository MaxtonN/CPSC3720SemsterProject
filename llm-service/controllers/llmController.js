const { Parse } = require('../models/llmModel');



const parseText = async (req, res) => {
    const response = await Parse(req.body.text);
    console.log(response);
    // check response for event name, number of tickets, intent (buy, view, etc.)

    // format event name, number of tickets, intent, etc. in json object, return with res
    const parsedInformation = JSON({"example":"example"});

    if(response){
        res.status(200).json(parsedInformation);
    }
    else{
        res.status(500).send("Server Error: Unknown Issue Occured");
    }
}

module.exports = { parseText };