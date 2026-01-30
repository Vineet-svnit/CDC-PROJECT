const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'CDC Registration <onboarding@resend.dev>', // Replace with your verified domain
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
            console.error('Error sending OTP email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in sendOTPEmail:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};