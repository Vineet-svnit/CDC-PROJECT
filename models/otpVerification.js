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
        program: String,
        branch: String,
        year: String,
        password: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Method to check if OTP is expired
otpVerificationSchema.methods.isExpired = function() {
    return Date.now() > this.expiresAt.getTime();
};

// Create index for automatic cleanup of old documents (after 10 minutes of creation)
// This gives users time to resend OTP even after the 3-minute expiration
otpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);