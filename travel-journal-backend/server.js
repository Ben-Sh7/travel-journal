require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Models (for mongoose to register them)
require('./models/User');
require('./models/Entry');
require('./models/Trip');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Routes **** בקשה → route → controller → model → מסד נתונים → תשובה ללקוח.
app.use('/auth', require('./routes/auth'));
app.use('/trips', require('./routes/trips'));
app.use('/entries', require('./routes/entries'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  