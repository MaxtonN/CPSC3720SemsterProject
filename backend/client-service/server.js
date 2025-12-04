const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/clientRoutes');

app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(cors());
app.use('/api', routes); // pass /api endpoints to routes
app.use((req, res) => {
    res.status(404).json({error: "Endpoint not found"});
});


const PORT = 6001;
if(require.main === module) {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

module.exports = app;