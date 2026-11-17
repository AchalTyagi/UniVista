// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, default: 'Student' },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    authProvider: {
        type: String,
        default: 'local'
    },
    // Using a mixed object allows us to easily drop in your existing localStorage profile JSON
    profileData: { type: Object, default: {} } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);