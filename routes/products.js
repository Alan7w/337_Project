const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// Get all products
router.get('/', (req, res) => {
    try {
        const products = req.app.locals.db.readProducts();
        res.json(products);
    } catch (err) {
        console.error('Error getting products:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get product by ID
router.get('/:id', (req, res) => {
    try {
        const products = req.app.locals.db.readProducts();
        const product = products.find(p => p.id === parseInt(req.params.id, 10));
        
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error('Error getting product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin only routes below
// Add new product
router.post('/', authMiddleware.ensureAdmin, (req, res) => {
    try {
        const products = req.app.locals.db.readProducts();
        const newProduct = {
            id: Date.now(), // Simple unique ID generation
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            imageUrl: req.body.imageUrl || '/images/placeholder.jpg',
            stock: parseInt(req.body.stock, 10) || 0
        };
        
        products.push(newProduct);
        req.app.locals.db.writeProducts(products);
        
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product
router.put('/:id', authMiddleware.ensureAdmin, (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const products = req.app.locals.db.readProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Update product fields
        products[index] = {
            ...products[index],
            name: req.body.name || products[index].name,
            description: req.body.description || products[index].description,
            price: req.body.price ? parseFloat(req.body.price) : products[index].price,
            category: req.body.category || products[index].category,
            imageUrl: req.body.imageUrl || products[index].imageUrl,
            stock: req.body.stock ? parseInt(req.body.stock, 10) : products[index].stock
        };
        
        req.app.locals.db.writeProducts(products);
        res.json(products[index]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete product
router.delete('/:id', authMiddleware.ensureAdmin, (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const products = req.app.locals.db.readProducts();
        const filteredProducts = products.filter(p => p.id !== productId);
        
        if (filteredProducts.length === products.length) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        req.app.locals.db.writeProducts(filteredProducts);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;