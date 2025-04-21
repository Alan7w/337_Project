var bcrypt = require('bcryptjs');
var fs = require('fs');
var path = require('path');

class User {
    constructor(data) {
        this.username = data.username;
        this.email = data.email;
        this.passwordHash = data.passwordHash;
        this.isAdmin = data.isAdmin || false;
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    // Hash password
    static async hashPassword(password) {
        try {
            var salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            throw error;
        }
    }

    // Compare password
    async comparePassword(candidatePassword) {
        try {
            return await bcrypt.compare(candidatePassword, this.passwordHash);
        } catch (error) {
            throw error;
        }
    }

    // Find user by username
    static findByUsername(username, dbOperations) {
        var users = dbOperations.readUsers();
        return users.find(function(user) { return user.username === username; });
    }

    // Find user by email
    static findByEmail(email, dbOperations) {
        var users = dbOperations.readUsers();
        return users.find(function(user) { return user.email === email; });
    }

    // Save user
    save(dbOperations) {
        var users = dbOperations.readUsers();
        
        // Check if user already exists
        var existingUser = users.find(function(user) {
            return user.username === this.username || user.email === this.email;
        }, this);
        
        if (existingUser) {
            throw new Error('User already exists');
        }
        
        users.push(this);
        return dbOperations.writeUsers(users);
    }
}

module.exports = User;