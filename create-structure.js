var fs = require('fs');
var path = require('path');

// Create directories
var directories = [
    'config',
    'models',
    'routes',
    'controllers',
    'middleware',
    'public/css',
    'public/js',
    'public/pages',
    'data' // For JSON file storage as alternative to MongoDB
];

directories.forEach(function(dir) {
    var dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('Created directory:', dir);
    }
});

// Create initial files (empty)
var files = [
    'routes/auth.js',
    'controllers/authController.js',
    'middleware/authMiddleware.js',
    'public/css/styles.css',
    'public/js/login.js',
    'public/js/register.js',
    'public/js/profile.js',
    'public/pages/login.html',
    'public/pages/register.html',
    'public/pages/profile.html',
    'data/users.json',
    'data/products.json',
    'data/orders.json'
];

files.forEach(function(file) {
    var filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        // Initialize JSON files with empty arrays
        if (file.endsWith('.json')) {
            fs.writeFileSync(filePath, '[]');
        } else {
            fs.writeFileSync(filePath, '');
        }
        console.log('Created file:', file);
    }
});

console.log('Project structure created successfully!');