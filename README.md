# Tech E-commerce Web Application

A simple e-commerce web application for tech products.

## Quick Setup

1. Install Node.js (if not already installed)
   - Download from: https://nodejs.org/

2. Install project dependencies:
   ```
   npm install
   ```

3. Create project structure:
   ```
   npm run setup
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and go to:
   ```
   http://localhost:8080
   ```

## Features

- User authentication (register, login, logout)
- Product browsing
- Shopping cart
- Admin dashboard (coming soon)

## Project Structure

```
tech-ecommerce/
├── config/          # Configuration files
├── models/          # Data models
├── routes/          # Route definitions
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── public/          # Static files
│   ├── css/         # Stylesheets
│   ├── js/          # Client-side JavaScript
│   └── pages/       # HTML pages
├── data/            # JSON database files
├── server.js        # Main server file
├── create-structure.js  # Setup script
└── package.json     # Project dependencies
```

## Development

This project uses file-based storage (JSON files) for development. In production, replace with MongoDB or other database.

## Team

- Tech E-commerce Development Team