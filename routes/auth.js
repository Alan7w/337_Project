var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');

// GET /auth/register - Show registration form
router.get('/register', function(req, res) {
    res.sendFile('register.html', { root: './public/pages' });
});

// POST /auth/register - Process registration
router.post('/register', authController.register);

// GET /auth/login - Show login form
router.get('/login', function(req, res) {
    res.sendFile('login.html', { root: './public/pages' });
});

// POST /auth/login - Process login
router.post('/login', authController.login);

// GET /auth/logout - Process logout
router.get('/logout', authController.logout);

module.exports = router;