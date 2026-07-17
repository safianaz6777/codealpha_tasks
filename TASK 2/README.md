# Mini Social Media Platform

Full-stack mini social media app - Express.js + built-in Node SQLite (`node:sqlite`) backend, HTML/CSS/JS frontend.

## Features
- User signup/login (JWT auth, hashed passwords)
- Create posts with REAL image upload (jpg/png/gif/webp)
- Like / Unlike posts
- Comment on posts
- Follow / Unfollow users
- Profile pages with bio + avatar upload
- Real database (users, posts, comments, likes, followers) using Node's built-in SQLite — no native compilation needed, works on any OS.

## Requirements
- Node.js **v22.5+** (uses built-in `node:sqlite` module — no Visual Studio / build tools needed)

## Setup & Run
```bash
npm install
npm start
```
Then open: http://localhost:3000

## Notes
- Database file `social.db` auto-creates on first run
- Uploaded images are saved in `/uploads` folder and served publicly
- JWT secret is in `middleware/auth.js` — change it for production use
- You'll see a harmless "SQLite is an experimental feature" warning in the console — this is expected and does not affect functionality
