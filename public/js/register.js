document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorMessage = document.getElementById('errorMessage');
    
    // Clear previous error
    errorMessage.textContent = '';
    
    // Basic client-side validation
    if (!username || !email || !password) {
        errorMessage.textContent = 'All fields are required';
        return;
    }
    
    // Email validation
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address';
        return;
    }
    
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
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            window.location.href = data.redirect || '/profile';
        } else {
            errorMessage.textContent = data.error || 'Registration failed';
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred during registration';
    });
});