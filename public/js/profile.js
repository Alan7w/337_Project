document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadUserProfile();
    
    // Set up tab navigation
    setupTabs();
    
    // Set up form event listeners
    setupFormListeners();
    
    // Set up password toggles
    setupPasswordToggles();
    
    // Update cart count
    updateCartCount();
});

// Load user profile data
function loadUserProfile() {
    fetch('/api/user')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load profile');
            }
            return response.json();
        })
        .then(function(user) {
            // Set user data in profile view
            document.getElementById('username').textContent = user.username;
            document.getElementById('email').textContent = user.email;
            document.getElementById('accountType').textContent = user.isAdmin ? 'Administrator' : 'Regular User';
            
            // Set user data in sidebar
            document.getElementById('sidebarUsername').textContent = user.username;
            const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('memberSince').textContent = memberSince;
            
            // Set user initials for avatar
            const initials = user.username.substring(0, 2).toUpperCase();
            document.getElementById('userInitials').textContent = initials;
            
            // Pre-fill edit form
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editEmail').value = user.email;
            
            // Load order history
            loadOrderHistory();
        })
        .catch(function(error) {
            console.error('Error:', error);
            showMessage('Failed to load profile data. Please try again later.', 'error');
        });
}

// Set up tab navigation
function setupTabs() {
    const tabLinks = document.querySelectorAll('.profile-nav li');
    const tabContents = document.querySelectorAll('.profile-tab');
    
    tabLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            // Remove active class from all links and tabs
            tabLinks.forEach(function(tab) {
                tab.classList.remove('active');
            });
            tabContents.forEach(function(content) {
                content.classList.remove('active');
            });
            
            // Add active class to clicked link and corresponding tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Set up form event listeners
function setupFormListeners() {
    // Account info edit button
    const editInfoBtn = document.getElementById('editInfoBtn');
    if (editInfoBtn) {
        editInfoBtn.addEventListener('click', function() {
            document.getElementById('viewMode').style.display = 'none';
            document.getElementById('editMode').style.display = 'block';
            this.style.display = 'none';
        });
    }
    
    // Cancel button
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            document.getElementById('editMode').style.display = 'none';
            document.getElementById('viewMode').style.display = 'block';
            document.getElementById('editInfoBtn').style.display = 'block';
            
            // Reset form to original values
            loadUserProfile();
        });
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePassword();
        });
    }
    
    // Password field validation
    const newPasswordField = document.getElementById('newPassword');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (newPasswordField) {
        newPasswordField.addEventListener('input', validatePassword);
    }
    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                deleteAccount();
            }
        });
    }
}

// Update profile information
function updateProfile() {
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    
    // Basic validation
    if (!username || !email) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Username validation
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        showMessage('Username must be at least 3 characters and contain only letters, numbers, and underscores', 'error');
        return;
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#profileForm button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    
    fetch('/api/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            email: email
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        if (data.success) {
            showMessage('Profile updated successfully', 'success');
            
            // Switch back to view mode
            document.getElementById('editMode').style.display = 'none';
            document.getElementById('viewMode').style.display = 'block';
            document.getElementById('editInfoBtn').style.display = 'block';
            
            // Reload profile data
            loadUserProfile();
        } else {
            showMessage(data.error || 'Failed to update profile', 'error');
        }
    })
    .catch(function(error) {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        console.error('Error:', error);
        showMessage('An error occurred while updating profile', 'error');
    });
}

// Set up password toggles
function setupPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const inputField = this.parentElement.querySelector('input');
            const showPasswordIcon = this.querySelector('.show-password');
            const hidePasswordIcon = this.querySelector('.hide-password');
            
            if (inputField.type === 'password') {
                inputField.type = 'text';
                showPasswordIcon.style.display = 'none';
                hidePasswordIcon.style.display = 'block';
            } else {
                inputField.type = 'password';
                showPasswordIcon.style.display = 'block';
                hidePasswordIcon.style.display = 'none';
            }
        });
    });
}

// Password validation patterns
const lengthPattern = /.{8,}/;
const uppercasePattern = /[A-Z]/;
const lowercasePattern = /[a-z]/;
const numberPattern = /[0-9]/;

// Validate password as user types
function validatePassword() {
    const password = document.getElementById('newPassword').value;
    
    // Check each requirement
    if (lengthPattern.test(password)) {
        document.getElementById('pw-length').classList.add('valid');
    } else {
        document.getElementById('pw-length').classList.remove('valid');
    }
    
    if (uppercasePattern.test(password)) {
        document.getElementById('pw-uppercase').classList.add('valid');
    } else {
        document.getElementById('pw-uppercase').classList.remove('valid');
    }
    
    if (lowercasePattern.test(password)) {
        document.getElementById('pw-lowercase').classList.add('valid');
    } else {
        document.getElementById('pw-lowercase').classList.remove('valid');
    }
    
    if (numberPattern.test(password)) {
        document.getElementById('pw-number').classList.add('valid');
    } else {
        document.getElementById('pw-number').classList.remove('valid');
    }
    
    // Check match as well
    validatePasswordMatch();
}

// Check if passwords match
function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && confirmPassword) {
        if (newPassword === confirmPassword) {
            document.getElementById('pw-match').classList.add('valid');
        } else {
            document.getElementById('pw-match').classList.remove('valid');
        }
    } else {
        document.getElementById('pw-match').classList.remove('valid');
    }
}

// Check if all password requirements are met
function allPasswordRequirementsMet() {
    return (
        document.getElementById('pw-length').classList.contains('valid') &&
        document.getElementById('pw-uppercase').classList.contains('valid') &&
        document.getElementById('pw-lowercase').classList.contains('valid') &&
        document.getElementById('pw-number').classList.contains('valid') &&
        document.getElementById('pw-match').classList.contains('valid')
    );
}

// Update password
function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showPasswordError('All fields are required');
        return;
    }
    
    // Check password requirements
    if (!allPasswordRequirementsMet()) {
        showPasswordError('Please meet all password requirements');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#passwordForm button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Updating...';
    
    fetch('/api/user/password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        if (data.success) {
            // Clear form
            document.getElementById('passwordForm').reset();
            
            // Clear validation classes
            document.querySelectorAll('.requirement').forEach(function(el) {
                el.classList.remove('valid');
            });
            
            showMessage('Password updated successfully', 'success');
        } else {
            showPasswordError(data.error || 'Failed to update password');
        }
    })
    .catch(function(error) {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        console.error('Error:', error);
        showPasswordError('An error occurred while updating password');
    });
}

// Delete account
function deleteAccount() {
    fetch('/api/user', {
        method: 'DELETE'
    })
    .then(function(response) {
        if (response.ok) {
            // Redirect to home page after account deletion
            window.location.href = '/?message=account_deleted';
        } else {
            return response.json().then(function(data) {
                throw new Error(data.error || 'Failed to delete account');
            });
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        showMessage('Failed to delete account: ' + error.message, 'error');
    });
}

// Load order history
function loadOrderHistory() {
    const orderList = document.getElementById('orderList');
    if (!orderList) return;
    
    fetch('/api/user/orders')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load orders');
            }
            return response.json();
        })
        .then(function(orders) {
            orderList.innerHTML = '';
            
            if (orders.length === 0) {
                orderList.innerHTML = `
                    <div class="empty-orders">
                        <h3>No orders yet</h3>
                        <p>You haven't placed any orders yet.</p>
                        <a href="/products" class="btn btn-primary">Start Shopping</a>
                    </div>
                `;
                return;
            }
            
            // Sort orders by date (newest first)
            orders.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            });
            
            orders.forEach(function(order) {
                const orderDate = new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                const orderCard = document.createElement('div');
                orderCard.className = 'order-card';
                
                // Build order items HTML
                let orderItemsHtml = '';
                order.items.forEach(function(item) {
                    orderItemsHtml += `
                        <div class="order-item">
                            <img src="${item.imageUrl || '../images/placeholder.jpg'}" alt="${item.name}" onerror="this.src='../images/placeholder.jpg'">
                            <div class="order-item-details">
                                <div class="order-item-name">${item.name}</div>
                                <div class="order-item-price">$${item.price.toFixed(2)}</div>
                                <div class="order-item-quantity">Quantity: ${item.qty}</div>
                            </div>
                        </div>
                    `;
                });
                
                orderCard.innerHTML = `
                    <div class="order-header">
                        <div class="order-info">
                            <div>Order #${order.id}</div>
                            <div class="order-date">${orderDate}</div>
                        </div>
                        <div class="order-status ${order.status || 'delivered'}">${order.status || 'Delivered'}</div>
                    </div>
                    <div class="order-body">
                        <div class="order-items">
                            ${orderItemsHtml}
                        </div>
                        <div class="order-total">
                            Total: $${order.total.toFixed(2)}
                        </div>
                    </div>
                `;
                
                orderList.appendChild(orderCard);
            });
        })
        .catch(function(error) {
            console.error('Error:', error);
            orderList.innerHTML = `
                <div class="empty-orders">
                    <h3>Error Loading Orders</h3>
                    <p>There was a problem loading your order history. Please try again later.</p>
                </div>
            `;
        });
}

// Update cart count
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;
    
    fetch('/api/cart')
        .then(response => {
            if (!response.ok) {
                throw new Error('Not logged in or cart unavailable');
            }
            return response.json();
        })
        .then(data => {
            const itemCount = data.items.reduce((total, item) => total + item.qty, 0);
            cartCountElement.textContent = itemCount > 0 ? itemCount : '';
            cartCountElement.style.display = itemCount > 0 ? 'inline-block' : 'none';
        })
        .catch(error => {
            // Don't show errors for this - it's expected to fail when not logged in
            cartCountElement.style.display = 'none';
        });
}

// Show general message
function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    
    messageBox.textContent = message;
    messageBox.className = 'message ' + type;
    messageBox.style.display = 'block';
    
    // Scroll to message
    messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide message after 3 seconds
    setTimeout(function() {
        messageBox.style.display = 'none';
    }, 3000);
}

// Show password error
function showPasswordError(message) {
    const errorElement = document.getElementById('passwordError');
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Scroll to error
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}