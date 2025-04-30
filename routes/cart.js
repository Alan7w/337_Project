// Cart Module

var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

var productsFile = path.join(__dirname, '..', 'data', 'products.json');
var ordersFile   = path.join(__dirname, '..', 'data', 'orders.json');

// Read JSON from file or return empty array
function read(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
}

// Write JSON to file
function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// GET /cart - list cart items
router.get('/', function(req, res) {
  if (!req.session.cart) req.session.cart = [];
  var cart = req.session.cart;
  var products = read(productsFile);
  var items = [];
  var total = 0;

  for (var i = 0; i < cart.length; i++) {
    var prod = products.find(function(p) { return p.id === cart[i].productId; });
    if (!prod) continue;
    var qty = cart[i].qty;
    var subtotal = prod.price * qty;
    items.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      qty: qty,
      subtotal: subtotal
    });
    total += subtotal;
  }

  res.json({ items: items, total: total });
});

// POST /cart/add - add to cart
router.post('/add', function(req, res) {
  if (!req.session.cart) req.session.cart = [];
  var productId = parseInt(req.body.productId, 10);
  var qty = parseInt(req.body.qty, 10) || 1;
  var cart = req.session.cart;
  var found = false;

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      cart[i].qty += qty;
      found = true;
      break;
    }
  }
  if (!found) {
    cart.push({ productId: productId, qty: qty });
  }

  res.json({ cart: cart });
});

// POST /cart/remove - remove from cart
router.post('/remove', function(req, res) {
  if (!req.session.cart) req.session.cart = [];
  var productId = parseInt(req.body.productId, 10);
  req.session.cart = req.session.cart.filter(function(item) {
    return item.productId !== productId;
  });
  res.json({ cart: req.session.cart });
});

// POST /cart/checkout - save order and clear cart
router.post('/checkout', function(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in.' });
  }
  if (!req.session.cart) req.session.cart = [];
  var cart = req.session.cart;
  var products = read(productsFile);
  var orders = read(ordersFile);
  var total = 0;
  var items = [];

  for (var i = 0; i < cart.length; i++) {
    var prod = products.find(function(p) { return p.id === cart[i].productId; });
    if (!prod) continue;
    var qty = cart[i].qty;
    items.push({ productId: prod.id, name: prod.name, price: prod.price, qty: qty });
    total += prod.price * qty;
  }

  var order = {
    id: Date.now(),
    userId: req.session.userId,
    items: items,
    total: total,
    date: new Date().toISOString()
  };

  orders.push(order);
  write(ordersFile, orders);
  req.session.cart = [];

  res.json({ success: true, order: order });
});

module.exports = router;
