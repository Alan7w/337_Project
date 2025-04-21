var User = require('../models/User');

// Register new user
exports.register = async function(req, res) {
    try {
        var { username, email, password } = req.body;
        
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }
        
        // Check if user already exists
        var existingUserByUsername = User.findByUsername(username, req.app.locals.db);
        var existingUserByEmail = User.findByEmail(email, req.app.locals.db);
        
        if (existingUserByUsername || existingUserByEmail) {
            return res.status(400).json({ 
                error: 'User already exists' 
            });
        }
        
        // Hash password
        var passwordHash = await User.hashPassword(password);
        
        // Create new user
        var newUser = new User({
            username: username,
            email: email,
            passwordHash: passwordHash,
            isAdmin: false
        });
        
        // Save user
        newUser.save(req.app.locals.db);
        
        // Create session
        req.session.userId = username;
        req.session.isAdmin = false;
        
        res.json({ 
            success: true, 
            message: 'Registration successful',
            redirect: '/profile'
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed' 
        });
    }
};

// Login user
exports.login = async function(req, res) {
    try {
        var { username, password } = req.body;
        
        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Username and password are required' 
            });
        }
        
        // Find user
        var user = User.findByUsername(username, req.app.locals.db);
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }
        
        // Validate password
        var userModel = new User(user);
        var isMatch = await userModel.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }
        
        // Create session
        req.session.userId = user.username;
        req.session.isAdmin = user.isAdmin;
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            redirect: '/profile'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed' 
        });
    }
};

// Logout user
exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                error: 'Logout failed' 
            });
        }
        res.redirect('/');
    });
};