const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

function readJSON(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------- Products ----------
function getAllProducts() {
  return readJSON(PRODUCTS_FILE);
}

function getProductById(id) {
  const products = getAllProducts();
  return products.find((p) => p.id === Number(id));
}

function updateProductStock(id, newStock) {
  const products = getAllProducts();
  const idx = products.findIndex((p) => p.id === Number(id));
  if (idx !== -1) {
    products[idx].stock = newStock;
    writeJSON(PRODUCTS_FILE, products);
  }
}

// ---------- Users ----------
function getAllUsers() {
  return readJSON(USERS_FILE);
}

function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function getUserById(id) {
  const users = getAllUsers();
  return users.find((u) => u.id === Number(id));
}

function createUser(user) {
  const users = getAllUsers();
  const newUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    ...user,
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  return newUser;
}

// ---------- Orders ----------
function getAllOrders() {
  return readJSON(ORDERS_FILE);
}

function getOrdersByUser(userId) {
  return getAllOrders().filter((o) => o.userId === Number(userId));
}

function createOrder(order) {
  const orders = getAllOrders();
  const newOrder = {
    id: orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1,
    createdAt: new Date().toISOString(),
    ...order,
  };
  orders.push(newOrder);
  writeJSON(ORDERS_FILE, orders);
  return newOrder;
}

module.exports = {
  getAllProducts,
  getProductById,
  updateProductStock,
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  getAllOrders,
  getOrdersByUser,
  createOrder,
};
