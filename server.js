var express = require('express');
var session = require('express-session');
var path = require('path');
var fs = require('fs');

// Initialize Express app
var app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: 'tech-ecommerce-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Simple file-based database operations
var dbOperations = {
    readUsers: function() {
        try {
            var data = fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    },
    writeUsers: function(users) {
        try {
            fs.writeFileSync(path.join(__dirname, 'data', 'users.json'), JSON.stringify(users, null, 2));
            return true;
        } catch (error) {
            console.error('Error writing users:', error);
            return false;
        }
    }
};

// Make dbOperations available to routes
app.locals.db = dbOperations;

// Import routes
var authRouter = require('./routes/auth');

// Routes
app.get('/', function(req, res) {
    res.send(`
        <h1>Welcome to Tech E-commerce!</h1>
        <p>Getting started:</p>
        <ul>
            <li><a href="/auth/register">Register</a></li>
            <li><a href="/auth/login">Login</a></li>
        </ul>
    `);
});

// Authentication routes
app.use('/auth', authRouter);

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