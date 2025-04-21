var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    var user = this;
    
    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('passwordHash')) {
        return next();
    }
    
    try {
        // Generate salt
        var salt = await bcrypt.genSalt(10);
        // Hash the password
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.passwordHash);
    } catch (error) {
        throw error;
    }
};

var User = mongoose.model('User', userSchema);

module.exports = User;