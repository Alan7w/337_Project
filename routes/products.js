const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function readProducts() {
    const dataPath = path.join(__dirname, '../data/products.json');
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading products:', err);
        return [];
    }
}

router.get('/', (req, res) => {
    const products = readProducts();
    res.json(products);
});

router.get('/:id', (req, res) => {
    const products = readProducts();
    const product = products.find(p => p.id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

module.exports = router;
