const emailjs = require('@emailjs/nodejs');

// Initialize EmailJS with your credentials
emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

// Generate 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email using EmailJS
const sendOTPEmail = async (email, otp, name) => {
    try {
        const templateParams = {
            to_email: email,
            to_name: name,
            otp_code: otp,
            from_name: 'CDC Registration',
            message: `Your OTP verification code is: ${otp}. This code is valid for 10 minutes.`
        };

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('Email sent successfully:', response);
        return { success: true, data: response };

    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};