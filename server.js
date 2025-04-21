var express = require('express');
var session = require('express-session');
var path = require('path');
var connectDB = require('./config/db');
require('dotenv').config();

// Initialize Express app
var app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'tech-ecommerce-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Routes will be added here
app.get('/', function(req, res) {
    res.send('Welcome to Tech E-commerce!');
});

// Error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
var PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
    console.log(`Server is running on http://localhost:${PORT}`);
});