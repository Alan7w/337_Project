document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const errorMessage = document.getElementById('errorMessage');
    
    // Password requirement elements
    const lengthRequirement = document.getElementById('length');
    const uppercaseRequirement = document.getElementById('uppercase');
    const lowercaseRequirement = document.getElementById('lowercase');
    const numberRequirement = document.getElementById('number');
    const matchRequirement = document.getElementById('match');
    
    // Password validation patterns
    const lengthPattern = /.{8,}/;
    const uppercasePattern = /[A-Z]/;
    const lowercasePattern = /[a-z]/;
    const numberPattern = /[0-9]/;
    
    // Toggle password visibility for password field
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
    
    // Toggle password visibility for confirm password field
    if (confirmPasswordToggle) {
        confirmPasswordToggle.addEventListener('click', function() {
            const showPasswordIcon = this.querySelector('.show-password');
            const hidePasswordIcon = this.querySelector('.hide-password');
            
            if (confirmPasswordField.type === 'password') {
                confirmPasswordField.type = 'text';
                showPasswordIcon.style.display = 'none';
                hidePasswordIcon.style.display = 'block';
            } else {
                confirmPasswordField.type = 'password';
                showPasswordIcon.style.display = 'block';
                hidePasswordIcon.style.display = 'none';
            }
        });
    }
    
    // Live password validation
    if (passwordField) {
        passwordField.addEventListener('input', validatePassword);
    }
    
    // Check password match when confirm password changes
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }
    
    // Password validation function
    function validatePassword() {
        const password = passwordField.value;
        
        // Check each requirement
        if (lengthPattern.test(password)) {
            lengthRequirement.classList.add('valid');
        } else {
            lengthRequirement.classList.remove('valid');
        }
        
        if (uppercasePattern.test(password)) {
            uppercaseRequirement.classList.add('valid');
        } else {
            uppercaseRequirement.classList.remove('valid');
        }
        
        if (lowercasePattern.test(password)) {
            lowercaseRequirement.classList.add('valid');
        } else {
            lowercaseRequirement.classList.remove('valid');
        }
        
        if (numberPattern.test(password)) {
            numberRequirement.classList.add('valid');
        } else {
            numberRequirement.classList.remove('valid');
        }
        
        // Check match as well when validating password
        validatePasswordMatch();
    }
    
    // Check if passwords match
    function validatePasswordMatch() {
        if (passwordField.value && confirmPasswordField.value) {
            if (passwordField.value === confirmPasswordField.value) {
                matchRequirement.classList.add('valid');
            } else {
                matchRequirement.classList.remove('valid');
            }
        } else {
            matchRequirement.classList.remove('valid');
        }
    }
    
    // Check if all password requirements are met
    function allRequirementsMet() {
        return (
            lengthRequirement.classList.contains('valid') &&
            uppercaseRequirement.classList.contains('valid') &&
            lowercaseRequirement.classList.contains('valid') &&
            numberRequirement.classList.contains('valid') &&
            matchRequirement.classList.contains('valid')
        );
    }
    
    // Form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = passwordField.value;
            const confirmPassword = confirmPasswordField.value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Basic validation
            if (!username || !email || !password || !confirmPassword) {
                showError('All fields are required');
                return;
            }
            
            // Username validation
            if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
                showError('Username must be at least 3 characters and contain only letters, numbers, and underscores');
                return;
            }
            
            // Email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            // Check password requirements
            if (!allRequirementsMet()) {
                showError('Please meet all password requirements');
                return;
            }
            
            // Terms agreement
            if (!agreeTerms) {
                showError('You must agree to the Terms & Conditions');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';
            
            // Send registration request
            fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                if (data.success) {
                    // Redirect to the profile page or specified redirect URL
                    window.location.href = data.redirect || '/profile';
                } else {
                    showError(data.error || 'Registration failed');
                }
            })
            .catch(error => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                console.error('Error:', error);
                showError('An error occurred during registration');
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