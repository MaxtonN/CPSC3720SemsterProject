require("dotenv").config(); // for JWT_SECRET key
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const routes = require('./routes/authRoutes');


app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cors());
app.use('/api', routes);
app.use((req, res) => {
    res.status(404).json({error: "Endpoint not found"});
});

const PORT = 5000;

if(require.main === module){
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
module.exports = app;