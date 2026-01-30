# OTP Verification Setup Instructions

This document provides instructions for setting up the OTP verification system using Resend SDK for email delivery.

## Features Implemented

✅ **4-digit OTP Generation**: Secure random 4-digit codes
✅ **Email Delivery**: Professional email templates using Resend
✅ **Temporary Storage**: OTP and user data stored temporarily with 10-minute expiration
✅ **Resend Functionality**: Users can request new OTP if needed
✅ **User-friendly Interface**: Modern, responsive OTP input form
✅ **Security**: OTP expires after 10 minutes, one-time use only

## Setup Steps

### 1. Install Dependencies
The required dependency has already been installed:
```bash
npm install resend
```

### 2. Get Resend API Key
1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain (or use their test domain for development)
4. Generate an API key from the dashboard

### 3. Configure Environment Variables
Update your `.env` file with your Resend API key:
```env
RESEND_API_KEY=your_actual_resend_api_key_here
```

### 4. Update Email Domain (Important!)
In `utils/otpService.js`, update the `from` field with your verified domain:
```javascript
from: 'CDC Registration <noreply@yourdomain.com>', // Replace with your verified domain
```

For development, you can use Resend's test domain:
```javascript
from: 'CDC Registration <onboarding@resend.dev>',
```

## File Structure

```
├── models/
│   └── otpVerification.js          # OTP storage model
├── utils/
│   └── otpService.js               # OTP generation and email service
├── views/register_login/
│   └── otpVerification.ejs         # OTP verification page
├── public/css/
│   └── otp.css                     # OTP page styling
└── app.js                          # Updated with OTP routes
```

## How It Works

### Registration Flow
1. User fills registration form
2. System generates 4-digit OTP
3. User data and OTP stored temporarily in database
4. OTP sent to user's email
5. User enters OTP on verification page
6. If OTP is correct, user account is created
7. User is automatically logged in

### Security Features
- OTP expires after 10 minutes
- Temporary data is automatically cleaned up
- OTP is deleted after successful verification
- Email validation ensures only valid institute emails
- Rate limiting can be added for additional security

## API Endpoints

### POST /register
- Initiates registration process
- Generates and sends OTP
- Redirects to OTP verification page

### POST /verify-otp
- Verifies the entered OTP
- Creates user account if OTP is valid
- Logs in the user automatically

### POST /resend-otp
- Generates new OTP for existing verification request
- Resets the 10-minute timer
- Returns JSON response for AJAX handling

## Testing

### Development Testing
1. Use Resend's test domain: `onboarding@resend.dev`
2. Check Resend dashboard for email delivery logs
3. Test with valid institute email format

### Production Testing
1. Verify your domain with Resend
2. Update the `from` field in `otpService.js`
3. Test with real email addresses

## Customization Options

### Email Template
Modify the HTML template in `utils/otpService.js` to match your branding:
- Update colors and styling
- Add your logo
- Customize the message content

### OTP Length
To change from 4-digit to 6-digit OTP:
1. Update `generateOTP()` function in `utils/otpService.js`
2. Modify the OTP input fields in `otpVerification.ejs`
3. Update validation logic

### Expiration Time
Change the OTP expiration time in `models/otpVerification.js`:
```javascript
expires: 600 // 600 seconds = 10 minutes
```

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check Resend API key is correct
   - Verify domain is properly configured
   - Check Resend dashboard for error logs

2. **OTP not working**
   - Ensure OTP hasn't expired (10 minutes)
   - Check database for OTP record
   - Verify email address matches exactly

3. **Styling issues**
   - Ensure `otp.css` is properly linked
   - Check browser console for CSS errors
   - Verify Bootstrap is loading correctly

### Debug Mode
Add console logging to track the OTP flow:
```javascript
console.log('Generated OTP:', otp);
console.log('Email sent result:', emailResult);
```

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent OTP spam
2. **IP Tracking**: Log IP addresses for security monitoring
3. **Failed Attempts**: Implement lockout after multiple failed attempts
4. **Email Validation**: Ensure only valid institute emails are accepted

## Production Deployment

1. Set up proper domain verification with Resend
2. Configure production environment variables
3. Set up monitoring for email delivery
4. Implement proper error logging
5. Consider adding email delivery webhooks for tracking

## Support

For issues with:
- **Resend API**: Check [Resend Documentation](https://resend.com/docs)
- **Email Delivery**: Monitor Resend dashboard
- **Code Issues**: Check application logs and console errors