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
        console.log('🚀 Starting EmailJS send process...');
        console.log('📧 To Email:', email);
        console.log('👤 Name:', name);
        console.log('🔢 OTP:', otp);
        
        // Check environment variables
        console.log('🔑 Public Key:', process.env.EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing');
        console.log('🔐 Private Key:', process.env.EMAILJS_PRIVATE_KEY ? 'Set' : 'Missing');
        console.log('🆔 Service ID:', process.env.EMAILJS_SERVICE_ID || 'Missing');
        console.log('📄 Template ID:', process.env.EMAILJS_TEMPLATE_ID || 'Missing');
        
        // Check if required environment variables are set
        if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID) {
            throw new Error('EmailJS Service ID or Template ID is missing in environment variables');
        }
        
        if (!process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
            throw new Error('EmailJS Public Key or Private Key is missing in environment variables');
        }

        const templateParams = {
            email: email,        // For {{email}} in "To Email" field
            to_name: name,       // For {{to_name}} in template content
            otp_code: otp,       // For {{otp_code}} in template content
        };

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams
        );

        return { success: true, data: response };

    } catch (error) {
        console.error('❌ EmailJS Error Details:');
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        console.error('Error text:', error.text);
        console.error('Full error object:', error);
        
        return { 
            success: false, 
            error: error.message || 'Failed to send email via EmailJS'
        };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};