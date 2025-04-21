// Load user data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    setupEventListeners();
});

function loadUserProfile() {
    fetch('/api/user')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load profile');
            }
            return response.json();
        })
        .then(function(user) {
            document.getElementById('username').textContent = user.username;
            document.getElementById('email').textContent = user.email;
            document.getElementById('accountType').textContent = user.isAdmin ? 'Administrator' : 'Regular User';
            document.getElementById('memberSince').textContent = new Date(user.createdAt).toLocaleDateString();
            
            // Pre-fill edit form
            document.getElementById('editEmail').value = user.email;
        })
        .catch(function(error) {
            console.error('Error:', error);
            showMessage('Failed to load profile data', 'error');
        });
}

function setupEventListeners() {
    // Edit button click
    document.getElementById('editButton').addEventListener('click', function() {
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editButton').style.display = 'none';
    });
    
    // Cancel button click
    document.getElementById('cancelButton').addEventListener('click', function() {
        document.getElementById('editForm').style.display = 'none';
        document.getElementById('editButton').style.display = 'block';
        
        // Reset form to original values
        loadUserProfile();
    });
    
    // Form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
}

function updateProfile() {
    var email = document.getElementById('editEmail').value;
    
    // Basic email validation
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    fetch('/api/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            showMessage('Profile updated successfully', 'success');
            document.getElementById('editForm').style.display = 'none';
            document.getElementById('editButton').style.display = 'block';
            loadUserProfile(); // Reload profile data
        } else {
            showMessage(data.error || 'Failed to update profile', 'error');
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        showMessage('An error occurred while updating profile', 'error');
    });
}

function showMessage(message, type) {
    var messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = 'message ' + type;
    messageBox.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(function() {
        messageBox.style.display = 'none';
    }, 3000);
}