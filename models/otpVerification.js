const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpVerificationSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    userData: {
        username: String,
        email: String,
        name: String,
        phone: String,
        branch: String,
        year: String,
        password: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Document expires after 10 minutes (600 seconds)
    }
});

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);