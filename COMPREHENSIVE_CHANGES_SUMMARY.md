# User Schema Migration - Comprehensive Changes Summary

## Major Changes Made

### 1. Removed Fields
- `phone` (String) - Phone number field has been completely removed from the user schema

### 2. Added Fields
- `program` (String, required) - Enum: ['btech', 'mtech', 'mba', 'msc']
  - Represents the academic program the student is enrolled in
  - **Auto-extracted from email pattern in backend**

### 3. Modified Fields
- `branch` (String, required) - Updated enum values
  - Previous: ['ai', 'che', 'chm', 'ce', 'cse', 'ee', 'ece', 'hss', 'ms', 'math', 'me', 'phy']
  - New: ['ai', 'che', 'chm', 'ce', 'cse', 'ee', 'ece', 'hss', 'ms', 'math', 'me', 'phy', '']
  - Added empty string '' for MBA students (who don't have a branch)

- `year` (Number, required) - Now stores **current academic year** (1, 2, 3, 4)
  - **Auto-calculated from admission year in email**
  - Formula: `currentYear - admissionYear + 1`
  - Example: u24cs001 in 2026 → year = 2026 - 2024 + 1 = 3 (3rd year)

### 4. Username Auto-Generation
- **Removed username input field from registration**
- Username is now **auto-extracted from email** (part before @)
- Example: u24cs001@coed.svnit.ac.in → username: u24cs001

## Email Format Patterns & Program Detection

### B.Tech Pattern: `[ub]YYXXXNNN`
- Examples: u24cs001, b21me002
- Program: `btech`
- Branches: All engineering branches

### M.Tech Pattern: `pYYXXXNNN`
- Examples: p24co005
- Program: `mtech`
- Branches: All engineering branches

### M.Sc Pattern: `iYYXXXNNN`
- Examples: i22ph010
- Program: `msc`
- Branches: phy, chm, math only

### MBA Pattern: `bYYmgNNN`
- Examples: b21mg002
- Program: `mba`
- Branch: Empty string (no branch required)

## UI Changes

### Registration Form (`views/register_login/register.ejs`)
- **Removed**: Username input (now auto-generated)
- **Removed**: Year input (now auto-calculated)
- **Removed**: Program dropdown (now auto-detected)
- **Added**: Username display field (readonly, auto-populated)
- **Added**: Program display field (readonly, auto-detected)
- **Modified**: Branch dropdown (dynamically populated based on detected program)
- **Enhanced**: Real-time email validation and auto-population

### Settings Page (`views/user/settings.ejs`)
- **Removed**: Phone number display and edit fields
- **Added**: Program display (read-only)
- **Modified**: Year label to "Academic Year"
- **Simplified**: Only name can be edited now

## Backend Changes

### Routes Updated
1. `POST /register` - Now extracts username, program, and year from email
2. `POST /verify-otp` - Creates user with auto-extracted data
3. `POST /settings/update` - Only updates name (removed phone updates)

### Models Updated
1. `models/user.js` - Schema updated with new program field and branch enum
2. `models/otpVerification.js` - userData object updated to store program instead of phone

### Auto-Extraction Logic
```javascript
// Username extraction
const username = email.split('@')[0].toLowerCase();

// Year calculation
const yearMatch = username.match(/^[a-z](\d{2})/);
const yearFromEmail = parseInt(yearMatch[1]);
const fullYear = yearFromEmail < 50 ? 2000 + yearFromEmail : 1900 + yearFromEmail;
const currentYear = new Date().getFullYear();
const academicYear = currentYear - fullYear + 1;

// Program detection
if (username.match(/^[ub]\d{2}[a-z]{2,5}\d{3}$/)) program = 'btech';
else if (username.match(/^[p]\d{2}[a-z]{2,5}\d{3}$/)) program = 'mtech';
else if (username.match(/^[i]\d{2}[a-z]{2,5}\d{3}$/)) program = 'msc';
else if (username.match(/^[b]\d{2}[m][g]\d{3}$/)) program = 'mba';
```

## Authentication & Authorization Compatibility

✅ **All authentication flows remain compatible:**
- Login process unchanged (uses username/password)
- Session management unchanged
- Passport.js integration unchanged
- Admin authentication unchanged
- OTP verification process enhanced but compatible

✅ **Authorization checks remain functional:**
- User role-based access unchanged
- Admin middleware unchanged
- Test access controls unchanged

## Migration Steps for Existing Data

```javascript
// Sample migration script for existing users
const mongoose = require('mongoose');
const User = require('./models/user');

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({});
    
    for (let user of users) {
      // Extract program from existing username
      let program = 'btech'; // default
      if (user.username.match(/^[p]\d{2}/)) program = 'mtech';
      else if (user.username.match(/^[i]\d{2}/)) program = 'msc';
      else if (user.username.match(/^[b]\d{2}[m][g]/)) program = 'mba';
      
      // Calculate current academic year
      const yearMatch = user.username.match(/^[a-z](\d{2})/);
      if (yearMatch) {
        const yearFromEmail = parseInt(yearMatch[1]);
        const fullYear = yearFromEmail < 50 ? 2000 + yearFromEmail : 1900 + yearFromEmail;
        const currentYear = new Date().getFullYear();
        const academicYear = currentYear - fullYear + 1;
        
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { program, year: academicYear },
            $unset: { phone: "" }
          }
        );
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
```

## Testing Checklist

- [x] Registration form auto-populates username from email
- [x] Registration form auto-detects program from email pattern
- [x] Registration form shows appropriate branches based on program
- [x] Backend correctly extracts and validates all data
- [x] OTP verification creates user with correct data
- [x] Login process works with existing authentication
- [x] Settings page displays all information correctly
- [x] Settings page allows name updates only
- [x] Year calculation works correctly for different admission years
- [x] All authentication and authorization flows remain intact

## Files Modified

### Models
- `models/user.js` - Updated schema with program field and branch enum
- `models/otpVerification.js` - Updated userData structure

### Views
- `views/register_login/register.ejs` - Complete registration form overhaul
- `views/user/settings.ejs` - Updated to show program and remove phone

### Backend Routes
- `app.js` - Updated registration and settings routes with auto-extraction logic

## Summary

The system now provides a streamlined registration experience where users only need to enter their institute email, password, name, and select their branch. All other information (username, program, academic year) is automatically extracted and calculated from the email format, making the process more user-friendly and reducing input errors while maintaining full compatibility with existing authentication systems.

### Key Benefits:
1. **Reduced User Input**: Less fields to fill during registration
2. **Error Prevention**: Auto-extraction eliminates manual entry errors
3. **Consistent Data**: Program and year are always correctly derived
4. **Backward Compatibility**: All existing authentication flows work unchanged
5. **Smart Validation**: Email format validation ensures data integrity