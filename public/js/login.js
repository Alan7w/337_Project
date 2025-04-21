document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var errorMessage = document.getElementById('errorMessage');
    
    // Clear previous error
    errorMessage.textContent = '';
    
    // Basic client-side validation
    if (!username || !password) {
        errorMessage.textContent = 'Username and password are required';
        return;
    }
    
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
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            window.location.href = data.redirect || '/profile';
        } else {
            errorMessage.textContent = data.error || 'Login failed';
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred during login';
    });
});