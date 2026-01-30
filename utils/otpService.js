const { Resend } = require('resend');
const emailjs = require('@emailjs/nodejs');

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize EmailJS
emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

// Generate 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email using EmailJS or Resend
const sendOTPEmail = async (email, otp, name) => {
    // Use EmailJS if configured, otherwise fall back to Resend
    if (process.env.USE_EMAILJS === 'true' && process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID) {
        return await sendOTPWithEmailJS(email, otp, name);
    } else {
        return await sendOTPWithResend(email, otp, name);
    }
};

// EmailJS implementation
const sendOTPWithEmailJS = async (email, otp, name) => {
    try {
        const templateParams = {
            to_email: email,
            to_name: name,
            otp_code: otp,
            from_name: 'CDC Registration'
        };

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('EmailJS: Email sent successfully to', email);
        return { success: true, data: response };

    } catch (error) {
        console.error('EmailJS Error:', error);
        return { success: false, error: error.message };
    }
};

// Resend implementation (fallback)
const sendOTPWithResend = async (email, otp, name) => {
    try {
        // In development/testing mode, if email is not the verified one, log OTP to console
        const isTestingMode = !process.env.RESEND_DOMAIN_VERIFIED || process.env.RESEND_DOMAIN_VERIFIED !== 'true';
        const verifiedEmail = 'jenilp2146@gmail.com'; // Your verified email
        
        if (isTestingMode && email !== verifiedEmail) {
            console.log('='.repeat(50));
            console.log('🔐 OTP TESTING MODE (Resend)');
            console.log(`📧 Email: ${email}`);
            console.log(`🔢 OTP Code: ${otp}`);
            console.log(`👤 Name: ${name}`);
            console.log('='.repeat(50));
            
            // Return success for testing
            return { 
                success: true, 
                data: { 
                    id: 'test-mode-' + Date.now(),
                    message: 'OTP logged to console (testing mode)'
                }
            };
        }

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'CDC Registration <onboarding@resend.dev>',
            to: [email],
            subject: 'Verify Your Registration - OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Registration Verification</h2>
                    <p>Hello ${name},</p>
                    <p>Thank you for registering with CDC. To complete your registration, please use the following OTP code:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
                    <p>If you didn't request this registration, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px; text-align: center;">
                        This is an automated email. Please do not reply to this message.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in sendOTPWithResend:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};