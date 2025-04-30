
// Cart & Checkout Module 

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Paths to data files
const productsFile = path.join(dirname, '..', 'data', 'products.json');
const ordersFile   = path.join(dirname, '..', 'data', 'orders.json');

// Helper: read/write JSON
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
}
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Middleware: ensure user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.status(401).json({ error: 'Authentication required' });
}

// Initialize session cart
function initCart(req) {
  if (!req.session.cart) req.session.cart = [];
}

// POST /cart/add  → add or increment
router.post('/add', (req, res) => {
  initCart(req);
  const { productId, qty } = req.body;
  const quantity = parseInt(qty, 10) || 1;

  const existing = req.session.cart.find(item => item.productId === Number(productId));
  if (existing) {
    existing.qty += quantity;
  } else {
    req.session.cart.push({ productId: Number(productId), qty: quantity });
  }
  res.json({ cart: req.session.cart });
});

// GET /cart  → return cart items with product details
router.get('/', (req, res) => {
  initCart(req);
  const cart = req.session.cart;
  const products = readJson(productsFile);

  const items = cart.map(item => {
    const prod = products.find(p => p.id === item.productId);
    return {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      imageUrl: prod.imageUrl,
      qty: item.qty,
      subtotal: prod.price * item.qty
    };
  });
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  res.json({ items, total });
});

// POST /cart/update  → set quantity
router.post('/update', (req, res) => {
  initCart(req);
  const { productId, qty } = req.body;
  const quantity = parseInt(qty, 10) || 1;

  req.session.cart = req.session.cart.map(item =>
    item.productId === Number(productId)
      ? { productId: item.productId, qty: quantity }
      : item
  );
  res.json({ cart: req.session.cart });
});

// POST /cart/remove  → remove item
router.post('/remove', (req, res) => {
  initCart(req);
  const { productId } = req.body;
  req.session.cart = req.session.cart.filter(item => item.productId !== Number(productId));
  res.json({ cart: req.session.cart });
});

// POST /cart/checkout → persist order
router.post('/checkout', ensureAuthenticated, (req, res) => {
  initCart(req);
  const cart = req.session.cart;
  if (!cart.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const products = readJson(productsFile);
  const orders   = readJson(ordersFile);

  // Build order items and total
  let total = 0;
  const items = cart.map(item => {
    const prod = products.find(p => p.id === item.productId);
    total += prod.price * item.qty;
    return { productId: prod.id, name: prod.name, price: prod.price, qty: item.qty };
  });

  const order = {
    id: Date.now(),
    userId: req.session.userId,
    items,
    total,
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  writeJson(ordersFile, orders);
  req.session.cart = [];

  res.json({ success: true, order });
});

module.exports = router;
