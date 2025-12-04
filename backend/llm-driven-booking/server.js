require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/llmRoutes');
const llmServiceURL = "https://tigertix-llm-driven-booking-t3ik.onrender.com/";


app.use(express.json());// parse application/json
app.use(express.urlencoded({extended:true})); // parse application/x-www-urlencoded
app.use(cors({
    origin: 'https://tiger-tix-frontend.vercel.app'
}));
app.use('/api', routes);
app.use((req,res) => {
    res.status(404).json({error: "Endpoint not found"});
});

const PORT = 8080; // temp may change later
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
