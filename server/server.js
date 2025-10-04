const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's actual origin
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  },
}));


// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
