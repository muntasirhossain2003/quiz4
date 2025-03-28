
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Define the User Schema
const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'user',  // Default role is 'user'
            enum: ['user', 'admin'],  // Roles can be either 'user' or 'admin'
        },
        isVerified: {
            type: Boolean,
            default: false,  // User is unverified initially
        },
        verificationToken: String,
        verificationTokenExpire: Date,
    },
    {
        timestamps: true,  // Automatically adds createdAt and updatedAt timestamps
    }
);

// Password hashing before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password (for login)
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate a verification token for email verification
userSchema.methods.generateVerificationToken = function () {
    const token = crypto.randomBytes(20).toString('hex');
    this.verificationToken = token;
    this.verificationTokenExpire = Date.now() + 3600000;  // Token expires in 1 hour
    return token;
};

module.exports = mongoose.model('User', userSchema);
