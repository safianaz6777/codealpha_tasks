const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'super-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Make user, cart-count, and messages available in every view
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = {}; // { productId: qty }
  res.locals.currentUser = req.session.user || null;
  res.locals.cartCount = Object.values(req.session.cart).reduce((a, b) => a + b, 0);
  res.locals.successMsg = req.session.successMsg || null;
  res.locals.errorMsg = req.session.errorMsg || null;
  req.session.successMsg = null;
  req.session.errorMsg = null;
  next();
});

function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.errorMsg = 'Please login to continue.';
    return res.redirect('/login');
  }
  next();
}

// ---------- Home / Product Listing ----------
app.get('/', (req, res) => {
  const { category, search } = req.query;
  let products = db.getAllProducts();

  if (category && category !== 'All') {
    products = products.filter((p) => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(q));
  }

  const categories = ['All', ...new Set(db.getAllProducts().map((p) => p.category))];

  res.render('index', { products, categories, activeCategory: category || 'All', search: search || '' });
});

// ---------- Product Details ----------
app.get('/product/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).render('404');
  res.render('product', { product });
});

// ---------- Cart ----------
app.post('/cart/add/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.redirect('/');

  const qty = parseInt(req.body.quantity) || 1;
  const cart = req.session.cart;
  cart[product.id] = (cart[product.id] || 0) + qty;

  req.session.successMsg = `${product.name} added to cart.`;
  res.redirect(req.get('referer') || '/');
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart;
  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const product = db.getProductById(id);
      if (!product) return null;
      return { product, qty, subtotal: +(product.price * qty).toFixed(2) };
    })
    .filter(Boolean);

  const total = +items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
  res.render('cart', { items, total });
});

app.post('/cart/update/:id', (req, res) => {
  const qty = parseInt(req.body.quantity);
  if (qty <= 0) {
    delete req.session.cart[req.params.id];
  } else {
    req.session.cart[req.params.id] = qty;
  }
  res.redirect('/cart');
});

app.post('/cart/remove/:id', (req, res) => {
  delete req.session.cart[req.params.id];
  res.redirect('/cart');
});

// ---------- Auth: Register ----------
app.get('/register', (req, res) => {
  res.render('register', { formData: {} });
});

app.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    req.session.errorMsg = 'All fields are required.';
    return res.render('register', { formData: req.body });
  }
  if (password !== confirmPassword) {
    req.session.errorMsg = 'Passwords do not match.';
    return res.render('register', { formData: req.body });
  }
  if (db.getUserByEmail(email)) {
    req.session.errorMsg = 'An account with this email already exists.';
    return res.render('register', { formData: req.body });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = db.createUser({ name, email, password: hashed });

  req.session.user = { id: user.id, name: user.name, email: user.email };
  req.session.successMsg = `Welcome, ${user.name}! Your account has been created.`;
  res.redirect('/');
});

// ---------- Auth: Login ----------
app.get('/login', (req, res) => {
  res.render('login', { formData: {} });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email || '');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    req.session.errorMsg = 'Invalid email or password.';
    return res.render('login', { formData: req.body });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  req.session.successMsg = `Welcome back, ${user.name}!`;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ---------- Checkout ----------
app.get('/checkout', requireLogin, (req, res) => {
  const cart = req.session.cart;
  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const product = db.getProductById(id);
      if (!product) return null;
      return { product, qty, subtotal: +(product.price * qty).toFixed(2) };
    })
    .filter(Boolean);

  if (items.length === 0) return res.redirect('/cart');

  const total = +items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
  res.render('checkout', { items, total });
});

app.post('/checkout', requireLogin, (req, res) => {
  const cart = req.session.cart;
  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const product = db.getProductById(id);
      if (!product) return null;
      return { productId: product.id, name: product.name, price: product.price, qty, subtotal: +(product.price * qty).toFixed(2) };
    })
    .filter(Boolean);

  if (items.length === 0) return res.redirect('/cart');

  const { fullName, address, city, phone, paymentMethod } = req.body;
  const total = +items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);

  // reduce stock
  items.forEach((item) => {
    const product = db.getProductById(item.productId);
    if (product) {
      const newStock = Math.max(0, product.stock - item.qty);
      db.updateProductStock(item.productId, newStock);
    }
  });

  const order = db.createOrder({
    userId: req.session.user.id,
    items,
    total,
    shipping: { fullName, address, city, phone },
    paymentMethod,
    status: 'Processing',
  });

  req.session.cart = {};
  req.session.successMsg = `Order #${order.id} placed successfully!`;
  res.redirect(`/order-confirmation/${order.id}`);
});

app.get('/order-confirmation/:id', requireLogin, (req, res) => {
  const order = db.getAllOrders().find((o) => o.id === Number(req.params.id));
  if (!order || order.userId !== req.session.user.id) return res.status(404).render('404');
  res.render('order-confirmation', { order });
});

// ---------- Order History ----------
app.get('/orders', requireLogin, (req, res) => {
  const orders = db.getOrdersByUser(req.session.user.id).reverse();
  res.render('orders', { orders });
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
