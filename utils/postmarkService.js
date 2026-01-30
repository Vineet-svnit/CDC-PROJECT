const postmark = require('postmark');

// Initialize Postmark client
const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

// Generate 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email using Postmark
const sendOTPEmail = async (email, otp, name) => {
    try {
        console.log('🚀 Starting Postmark email send...');
        console.log('📧 To Email:', email);
        console.log('👤 Name:', name);
        console.log('🔢 OTP:', otp);
        
        // Check if API token is set
        if (!process.env.POSTMARK_API_TOKEN) {
            throw new Error('POSTMARK_API_TOKEN is missing in environment variables');
        }
        
        console.log('🔑 API Token:', process.env.POSTMARK_API_TOKEN ? 'Set' : 'Missing');
        console.log('📤 From Email:', process.env.POSTMARK_FROM_EMAIL || 'Not set');

        const emailData = {
            From: process.env.POSTMARK_FROM_EMAIL || 'noreply@example.com',
            To: email,
            Subject: 'Verify Your Registration - OTP Code',
            HtmlBody: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #333; margin: 0; font-size: 28px;">CDC Registration</h1>
                            <p style="color: #666; margin: 10px 0 0 0;">Career Development Cell</p>
                        </div>
                        
                        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification Required</h2>
                        
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                        
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            Thank you for registering with CDC. To complete your registration, please use the following OTP code:
                        </p>
                        
                        <div style="background-color: #f4f4f4; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; border-left: 4px solid #007bff;">
                            <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
                            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Enter this code to verify your email</p>
                        </div>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                <strong>⏰ Important:</strong> This OTP is valid for <strong>10 minutes</strong> only. Please do not share this code with anyone.
                            </p>
                        </div>
                        
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            If you didn't request this registration, please ignore this email.
                        </p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        
                        <div style="text-align: center;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                This is an automated email from CDC Registration System.<br>
                                Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </div>
            `,
            TextBody: `
Hello ${name},

Thank you for registering with CDC. To complete your registration, please use the following OTP code:

${otp}

This OTP is valid for 10 minutes. Please do not share this code with anyone.

If you didn't request this registration, please ignore this email.

Best regards,
CDC Team

---
This is an automated email. Please do not reply to this message.
            `,
            MessageStream: 'outbound'
        };

        console.log('📝 Email data prepared:', {
            From: emailData.From,
            To: emailData.To,
            Subject: emailData.Subject
        });

        const response = await client.sendEmail(emailData);

        console.log('✅ Postmark: Email sent successfully');
        console.log('📊 Response:', {
            MessageID: response.MessageID,
            SubmittedAt: response.SubmittedAt,
            To: response.To
        });

        return { 
            success: true, 
            data: {
                messageId: response.MessageID,
                submittedAt: response.SubmittedAt,
                to: response.To
            }
        };

    } catch (error) {
        console.error('❌ Postmark Error Details:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error status:', error.statusCode);
        console.error('Full error:', error);
        
        return { 
            success: false, 
            error: error.message || 'Failed to send email via Postmark'
        };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};