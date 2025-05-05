const express = require('express');
const router = express.Router();

// GET /api/cart - List cart items with product details
router.get('/', (req, res) => {
    try {
        // Initialize cart if it doesn't exist
        if (!req.session.cart) req.session.cart = [];
        
        const cart = req.session.cart;
        const products = req.app.locals.db.readProducts();
        const items = [];
        let total = 0;
        
        // Map cart items to include product details
        for (const item of cart) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const qty = item.qty;
                const subtotal = product.price * qty;
                
                items.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    qty: qty,
                    subtotal: subtotal,
                    imageUrl: product.imageUrl
                });
                
                total += subtotal;
            }
        }
        
        res.json({ items, total });
    } catch (err) {
        console.error('Error getting cart:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cart/add - Add item to cart
router.post('/add', (req, res) => {
    try {
        // Initialize cart if it doesn't exist
        if (!req.session.cart) req.session.cart = [];
        
        const productId = parseInt(req.body.productId, 10);
        const qty = parseInt(req.body.qty, 10) || 1;
        
        // Validate product exists and has enough stock
        const products = req.app.locals.db.readProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (product.stock <= 0) {
            return res.status(400).json({ error: 'Product out of stock' });
        }
        
        // Find existing item in cart or add new one
        const cart = req.session.cart;
        const existingItemIndex = cart.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
            // Update existing item
            cart[existingItemIndex].qty += qty;
        } else {
            // Add new item
            cart.push({ productId, qty });
        }
        
        res.json({ 
            success: true, 
            message: 'Product added to cart',
            cart: req.session.cart 
        });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cart/update - Update item quantity
router.post('/update', (req, res) => {
    try {
        if (!req.session.cart) req.session.cart = [];
        
        const productId = parseInt(req.body.productId, 10);
        const qty = parseInt(req.body.qty, 10);
        
        if (qty <= 0) {
            // Remove item if quantity is 0 or negative
            req.session.cart = req.session.cart.filter(item => item.productId !== productId);
        } else {
            // Update quantity
            const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
            
            if (itemIndex >= 0) {
                req.session.cart[itemIndex].qty = qty;
            } else {
                return res.status(404).json({ error: 'Item not found in cart' });
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Cart updated',
            cart: req.session.cart 
        });
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cart/remove - Remove item from cart
router.post('/remove', (req, res) => {
    try {
        if (!req.session.cart) req.session.cart = [];
        
        const productId = parseInt(req.body.productId, 10);
        
        // Filter out the item
        req.session.cart = req.session.cart.filter(item => item.productId !== productId);
        
        res.json({ 
            success: true, 
            message: 'Item removed from cart',
            cart: req.session.cart 
        });
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cart/checkout - Process checkout
router.post('/checkout', (req, res) => {
    try {
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        
        const products = req.app.locals.db.readProducts();
        const orders = req.app.locals.db.readOrders();
        const cart = req.session.cart;
        let total = 0;
        const orderItems = [];
        
        // Update product stock and build order items
        for (const item of cart) {
            const productIndex = products.findIndex(p => p.id === item.productId);
            
            if (productIndex >= 0) {
                const product = products[productIndex];
                
                // Check stock
                if (product.stock < item.qty) {
                    return res.status(400).json({ 
                        error: `Not enough stock for ${product.name}. Available: ${product.stock}`
                    });
                }
                
                // Update stock
                products[productIndex].stock -= item.qty;
                
                // Add to order items
                const subtotal = product.price * item.qty;
                orderItems.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    qty: item.qty,
                    subtotal: subtotal
                });
                
                total += subtotal;
            }
        }
        
        // Save updated product stock
        req.app.locals.db.writeProducts(products);
        
        // Create order
        const order = {
            id: Date.now(),
            userId: req.session.userId,
            items: orderItems,
            total: total,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        // Save order
        orders.push(order);
        req.app.locals.db.writeOrders(orders);
        
        // Clear cart
        req.session.cart = [];
        
        res.json({
            success: true,
            message: 'Order placed successfully',
            order: order
        });
    } catch (err) {
        console.error('Error processing checkout:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cart/clear - Clear cart
router.get('/clear', (req, res) => {
    req.session.cart = [];
    res.json({ 
        success: true, 
        message: 'Cart cleared' 
    });
});

module.exports = router;