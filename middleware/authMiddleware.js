// Middleware to check if user is authenticated
exports.ensureAuthenticated = function(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    
    // For API requests, return JSON error
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ 
            error: 'Authentication required' 
        });
    }
    
    // For regular requests, redirect to login
    res.redirect('/auth/login');
};

// Middleware to check if user is admin
exports.ensureAdmin = function(req, res, next) {
    if (req.session && req.session.userId && req.session.isAdmin) {
        return next();
    }
    
    // For API requests, return JSON error
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(403).json({ 
            error: 'Admin access required' 
        });
    }
    
    // For regular requests, redirect to home or login
    if (req.session && req.session.userId) {
        res.redirect('/'); // Authenticated but not admin
    } else {
        res.redirect('/auth/login'); // Not authenticated
    }
};

// Middleware to prevent authenticated users from accessing login/register
exports.preventAuthenticated = function(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/profile');
    }
    next();
};