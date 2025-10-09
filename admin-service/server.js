const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/adminRoutes');

app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(cors());
app.use('/api', routes);

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));