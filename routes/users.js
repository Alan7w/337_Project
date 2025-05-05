const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user - Get current user profile
router.get('/', (req, res) => {
    try {
        const users = req.app.locals.db.readUsers();
        const user = users.find(u => u.username === req.session.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Don't send password hash to client
        const { passwordHash, ...userWithoutPassword } = user;
        
        res.json(userWithoutPassword);
    } catch (err) {
        console.error('Error getting user profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/user - Update user profile (username and email)
router.put('/', async (req, res) => {
    try {
        const users = req.app.locals.db.readUsers();
        const userIndex = users.findIndex(u => u.username === req.session.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { username, email } = req.body;
        
        // Validate required fields
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required' });
        }
        
        // Check if username format is valid
        if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ 
                error: 'Username must be at least 3 characters and contain only letters, numbers, and underscores' 
            });
        }
        
        // Check if email format is valid
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Check if new username is already taken by another user
        if (username !== req.session.userId && 
            users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        
        // Check if new email is already in use by another user
        if (email !== users[userIndex].email && 
            users.some(u => u.username !== req.session.userId && u.email === email)) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        
        // Update session if username is changed
        const oldUsername = users[userIndex].username;
        if (username !== oldUsername) {
            req.session.userId = username;
        }
        
        // Update user data
        users[userIndex].username = username;
        users[userIndex].email = email;
        
        // Save updated users
        req.app.locals.db.writeUsers(users);
        
        // Don't send password hash to client
        const { passwordHash, ...userWithoutPassword } = users[userIndex];
        
        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: userWithoutPassword
        });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/user/password - Update user password
router.put('/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        
        // Validate new password format
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
        }
        
        if (!/[a-z]/.test(newPassword)) {
            return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
        }
        
        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({ error: 'Password must contain at least one number' });
        }
        
        const users = req.app.locals.db.readUsers();
        const userIndex = users.findIndex(u => u.username === req.session.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const userModel = new User(users[userIndex]);
        const isMatch = await userModel.comparePassword(currentPassword);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const passwordHash = await User.hashPassword(newPassword);
        
        // Update password hash
        users[userIndex].passwordHash = passwordHash;
        
        // Save updated users
        req.app.locals.db.writeUsers(users);
        
        res.json({ 
            success: true, 
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/user - Delete user account
router.delete('/', async (req, res) => {
    try {
        const users = req.app.locals.db.readUsers();
        const updatedUsers = users.filter(u => u.username !== req.session.userId);
        
        if (users.length === updatedUsers.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Save updated users
        req.app.locals.db.writeUsers(updatedUsers);
        
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            
            res.json({ 
                success: true, 
                message: 'Account deleted successfully'
            });
        });
    } catch (err) {
        console.error('Error deleting user account:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/user/orders - Get user orders
router.get('/orders', (req, res) => {
    try {
        const orders = req.app.locals.db.readOrders();
        const userOrders = orders.filter(order => order.userId === req.session.userId);
        
        // If user has no orders, return empty array
        if (!userOrders.length) {
            return res.json([]);
        }
        
        // Get products for images/details
        const products = req.app.locals.db.readProducts();
        
        // Enhance order items with product images
        const enhancedOrders = userOrders.map(order => {
            const enhancedItems = order.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    ...item,
                    imageUrl: product ? product.imageUrl : null
                };
            });
            
            return {
                ...order,
                items: enhancedItems
            };
        });
        
        res.json(enhancedOrders);
    } catch (err) {
        console.error('Error getting user orders:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;