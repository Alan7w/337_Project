document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordField = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInfo = document.getElementById('passwordInfo');
    const errorMessage = document.getElementById('errorMessage');
    
    // Toggle password visibility
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const showPasswordIcon = this.querySelector('.show-password');
            const hidePasswordIcon = this.querySelector('.hide-password');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                showPasswordIcon.style.display = 'none';
                hidePasswordIcon.style.display = 'block';
            } else {
                passwordField.type = 'password';
                showPasswordIcon.style.display = 'block';
                hidePasswordIcon.style.display = 'none';
            }
        });
    }
    
    // Show password requirements when password field is focused
    if (passwordField && passwordInfo) {
        passwordField.addEventListener('focus', function() {
            passwordInfo.classList.add('visible');
        });
        
        passwordField.addEventListener('blur', function() {
            if (!this.value) {
                passwordInfo.classList.remove('visible');
            }
        });
    }
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!username || !password) {
                showError('Please enter both username and password');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';
            
            // Send login request
            fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                if (data.success) {
                    // Get redirect URL from query string if present
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirectUrl = urlParams.get('redirect') || data.redirect || '/profile';
                    
                    // Redirect to the appropriate page
                    window.location.href = redirectUrl;
                } else {
                    showError(data.error || 'Login failed. Please check your credentials.');
                }
            })
            .catch(error => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                console.error('Error:', error);
                showError('An error occurred during login. Please try again.');
            });
        });
    }
    
    // Helper function to show error message
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            
            // Scroll to error message
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});