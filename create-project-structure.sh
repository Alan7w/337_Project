#!/bin/bash

# Create directory structure
mkdir -p config models routes controllers middleware public/css public/js public/pages

# Create initial files (empty)
touch routes/auth.js
touch controllers/authController.js
touch middleware/authMiddleware.js
touch public/css/styles.css
touch public/js/login.js
touch public/js/register.js
touch public/js/profile.js
touch public/pages/login.html
touch public/pages/register.html
touch public/pages/profile.html

echo "Project structure created successfully!"