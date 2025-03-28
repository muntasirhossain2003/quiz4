const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config(); // Load .env variables
const app = express();

app.use(express.json()); // Enable JSON body parsing
app.use(cors()); // Enable CORS

// Connect to MongoDB Atlas
connectDB();

app.get('/', (req, res) => {
    res.send('Task Management System API is Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
