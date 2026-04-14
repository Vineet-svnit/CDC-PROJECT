const nodemailer = require("nodemailer");

// Generate OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Gmail transporter
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASSWORD
//     }
// });

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    debug: true,   // 👈 IMPORTANT
    logger: true   // 👈 IMPORTANT
});

// Send OTP
const sendOTPEmail = async (email, otp, name) => {
    try {
        console.log("Before sendMail");
        const info = await transporter.sendMail({
            from: `"CDC Registration" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Verify Your Registration - OTP Code",
            html: `
                <h2>Hello ${name}</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>Valid for 3 minutes</p>
            `
        });

        console.log("After sendMail");

        return { success: true, data: info };

    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};