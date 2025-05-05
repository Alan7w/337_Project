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
var authMiddleware = require('./middleware/authMiddleware');
var cartRouter = require('./routes/cart');  


// Routes
app.get('/', function(req, res) {
    if (req.session && req.session.userId) {
        // User is logged in - show dashboard
        res.send(`
            <h1>Welcome to Tech E-commerce, ${req.session.userId}!</h1>
            <p>You are logged in as ${req.session.isAdmin ? 'Administrator' : 'User'}</p>
            <ul>
                <li><a href="/profile">Profile</a></li>
                <li><a href="/products">Products</a></li>
                <li><a href="/auth/logout">Logout</a></li>
            </ul>
        `);
    } else {
        // User is not logged in - show login/register
        res.sendFile('index.html', { root: './public/pages' });
    }
});

// Authentication routes
app.use('/auth', authRouter);

// Protected profile route
app.get('/profile', authMiddleware.ensureAuthenticated, function(req, res) {
    res.sendFile('profile.html', { root: './public/pages' });
});

// API route to get user data
app.get('/api/user', authMiddleware.ensureAuthenticated, function(req, res) {
    var users = req.app.locals.db.readUsers();
    var currentUser = users.find(function(user) {
        return user.username === req.session.userId;
    });
    
    if (currentUser) {
        // Don't send password hash
        var userProfile = {
            username: currentUser.username,
            email: currentUser.email,
            isAdmin: currentUser.isAdmin,
            createdAt: currentUser.createdAt
        };
        res.json(userProfile);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// API route to update user profile
app.put('/api/user', authMiddleware.ensureAuthenticated, function(req, res) {
    var users = req.app.locals.db.readUsers();
    var userIndex = users.findIndex(function(user) {
        return user.username === req.session.userId;
    });
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    var { email } = req.body;
    
    // Check if new email is already taken
    var emailTaken = users.some(function(user, index) {
        return user.email === email && index !== userIndex;
    });
    
    if (emailTaken) {
        return res.status(400).json({ error: 'Email already taken' });
    }
    
    // Update user email
    users[userIndex].email = email;
    
    if (req.app.locals.db.writeUsers(users)) {
        res.json({ success: true, message: 'Profile updated successfully' });
    } else {
        res.status(500).json({ error: 'Failed to update profile' });
    }
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
