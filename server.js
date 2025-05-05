const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

// Database operations
const dbOperations = {
    readUsers: function() {
        try {
            const data = fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error reading users:', err);
            return [];
        }
    },
    writeUsers: function(users) {
        try {
            fs.writeFileSync(
                path.join(__dirname, 'data/users.json'), 
                JSON.stringify(users, null, 2)
            );
            return true;
        } catch (err) {
            console.error('Error writing users:', err);
            return false;
        }
    },
    readProducts: function() {
        try {
            const data = fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error reading products:', err);
            return [];
        }
    },
    writeProducts: function(products) {
        try {
            fs.writeFileSync(
                path.join(__dirname, 'data/products.json'), 
                JSON.stringify(products, null, 2)
            );
            return true;
        } catch (err) {
            console.error('Error writing products:', err);
            return false;
        }
    },
    readOrders: function() {
        try {
            const data = fs.readFileSync(path.join(__dirname, 'data/orders.json'), 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error reading orders:', err);
            return [];
        }
    },
    writeOrders: function(orders) {
        try {
            fs.writeFileSync(
                path.join(__dirname, 'data/orders.json'), 
                JSON.stringify(orders, null, 2)
            );
            return true;
        } catch (err) {
            console.error('Error writing orders:', err);
            return false;
        }
    }
};

// Make dbOperations available to routes
app.locals.db = dbOperations;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Ensure required files exist
const requiredFiles = [
    { path: 'data/users.json', defaultContent: '[]' },
    { path: 'data/products.json', defaultContent: '[]' },
    { path: 'data/orders.json', defaultContent: '[]' }
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file.path);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file.defaultContent);
        console.log(`Created ${file.path}`);
    }
});

// Import route modules
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/users');

// API Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', authMiddleware.ensureAuthenticated, cartRoutes);
app.use('/api/user', authMiddleware.ensureAuthenticated, userRoutes);

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/products.html'));
});

app.get('/profile', authMiddleware.ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/profile.html'));
});

app.get('/cart', authMiddleware.ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/cart.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});