# Task 1 — Simple E-commerce Store

A basic e-commerce website built as part of the CodeAlpha internship tasks.

##  Tech Stack
- **Frontend:** HTML, CSS, JavaScript (EJS templating)
- **Backend:** Node.js + Express.js
- **Database:** JSON file-based storage (products, users, orders)
- **Authentication:** Session-based login with bcrypt password hashing

##  Features
- Product listing with category filter and search
- Product details page
- Shopping cart (add, update quantity, remove items)
- User registration and login
- Order processing / checkout with shipping details
- Order confirmation page
- Order history ("My Orders") for logged-in users

##  Project Structure
```
Task 1/
├── server.js          # Main Express server & all routes
├── db.js              # Database helper functions (read/write JSON files)
├── package.json        # Project dependencies
├── data/               # JSON "database" (products, users, orders)
├── views/               # EJS templates (pages)
│   └── partials/         # Shared header/footer
└── public/
    └── css/style.css     # Styling
```

##  How to Run Locally

1. Make sure [Node.js](https://nodejs.org) is installed on your computer.
2. Open a terminal inside this folder (`Task 1`).
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## 👤 Usage
- Register a new account or log in.
- Browse products, use the search bar or category filters.
- Add items to your cart.
- Go to checkout, fill shipping details, and place an order.
- View your order history under "My Orders".

