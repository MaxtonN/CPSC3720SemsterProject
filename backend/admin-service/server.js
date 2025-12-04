const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/adminRoutes');

app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cors());
app.use('/api', routes);
app.use((req, res) => {
    res.status(404).json({error: "Endpoint not found"});
});

const PORT = 5001;
// Only starts the server if not in testing mode
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

module.exports = app;