# Timezone Standardization Documentation

## Overview

This document outlines the standardized approach to handling timezones in the CDC project. The system now follows a consistent pattern where all times are stored in UTC in the database and converted to IST (Indian Standard Time) for frontend display.

## Problem Solved

When deploying to cloud platforms like Render, the server timezone may differ from the expected IST timezone. This caused issues with:
- Test scheduling and validation
- Time display inconsistencies
- Date/time input handling
- Announcement timestamps

## Solution Architecture

### Core Principle
- **Storage**: All times stored in database as UTC
- **Display**: All frontend times shown in IST
- **Input**: User inputs treated as IST and converted to UTC for storage

### File Structure

```
utils/
├── timeUtils.js          # Core timezone utility functions
└── templateHelpers.js    # EJS template helper functions
```

## Implementation Details

### 1. Time Utilities (`utils/timeUtils.js`)

**Key Functions:**
- `getCurrentUTC()` - Get current UTC time
- `getCurrentIST()` - Get current IST time
- `convertISTToUTC(date, time)` - Convert IST input to UTC for storage
- `convertUTCToIST(utcDate)` - Convert UTC to IST for display
- `formatDateIST(date)` - Format date in IST
- `formatTimeIST(date)` - Format time in IST
- `formatDateTimeIST(date)` - Format datetime in IST
- `getDateInputValue(date)` - Get HTML date input value in IST
- `getTimeInputValue(date)` - Get HTML time input value in IST

**Test Status Functions:**
- `hasTestStarted(startTime)` - Check if test has started
- `hasTestEnded(endTime)` - Check if test has ended
- `isTestActive(startTime, endTime)` - Check if test is currently active
- `getTestStatus(startTime, endTime)` - Get test status (upcoming/active/completed)

### 2. Template Helpers (`utils/templateHelpers.js`)

**Available in all EJS templates:**
- `formatDate(date)` - Format date for display
- `formatTime(date)` - Format time for display
- `formatDateTime(date)` - Format datetime for display
- `getDateInput(date)` - Get date value for HTML input
- `getTimeInput(date)` - Get time value for HTML input
- `hasStarted(startTime)` - Check if test has started
- `getCurrentYear()` - Get current year for copyright

## Updated Components

### Backend (app.js)

**Routes Updated:**
1. **Test Creation** (`POST /test/questions/new`)
   - Now uses `convertISTToUTC()` for proper time conversion
   
2. **Test Update** (`PUT /test/:id`)
   - Uses `convertISTToUTC()` for time conversion
   
3. **Test Validation** (`checkValidity` middleware)
   - Uses `hasTestStarted()` and `hasTestEnded()` functions
   
4. **Test Deletion** (`DELETE /test/:id`)
   - Uses `hasTestStarted()` to prevent deletion of started tests
   
5. **Announcement Creation** (`POST /announcement/new`)
   - Uses `getAnnouncementDate()` for consistent date formatting
   
6. **Stats API** (`GET /stats`)
   - Uses `getTestStatus()` for accurate test status calculation

### Frontend Templates

**Templates Updated:**
1. **dashboard.ejs**
   - Uses `formatDate()` and `formatTime()` for display
   - Uses `hasStarted()` for delete button state
   
2. **testEditForm.ejs**
   - Uses `getDateInput()` and `getTimeInput()` for form values
   - Uses `hasStarted()` for read-only state
   
3. **history.ejs**
   - Uses `formatDateTime()` for test start time display
   
4. **question.ejs**
   - Timer uses UTC times with proper conversion
   
5. **All footer templates**
   - Uses `getCurrentYear()` for copyright year

## Usage Examples

### Backend Usage

```javascript
// Import utilities
const { convertISTToUTC, hasTestStarted } = require('./utils/timeUtils');

// Convert user input (IST) to UTC for storage
const startTime = convertISTToUTC('2024-01-30', '14:30');

// Check test status
if (hasTestStarted(test.startTime)) {
    // Test has started
}
```

### Frontend Usage (EJS)

```html
<!-- Display formatted date and time -->
<p>Date: <%= formatDate(test.startTime) %></p>
<p>Time: <%= formatTime(test.startTime) %></p>

<!-- Form inputs with proper values -->
<input type="date" value="<%= getDateInput(test.startTime) %>">
<input type="time" value="<%= getTimeInput(test.startTime) %>">

<!-- Conditional rendering -->
<% if (hasStarted(test.startTime)) { %>
    <p>Test has started</p>
<% } %>
```

## Database Schema

**No changes required** - existing Date fields continue to work. The system now ensures:
- All new dates are stored in UTC
- Existing dates are handled correctly regardless of their original timezone

## Testing

### Development Testing
1. Set system timezone to different zones
2. Create tests and verify times display correctly in IST
3. Check test validation works across timezone boundaries

### Production Testing
1. Deploy to cloud platform (Render, Heroku, etc.)
2. Verify all time displays show IST regardless of server timezone
3. Test scheduling and validation functions

## Migration Notes

### Existing Data
- Existing dates in database are handled gracefully
- No data migration required
- System assumes existing dates are in appropriate timezone

### Deployment Considerations
1. **Environment Variables**: No additional env vars needed
2. **Server Timezone**: System works regardless of server timezone
3. **Database**: MongoDB handles UTC storage automatically

## Benefits

1. **Consistency**: All times display in IST regardless of server location
2. **Reliability**: Test scheduling works correctly on any cloud platform
3. **Maintainability**: Centralized time handling logic
4. **Scalability**: Easy to add new timezone features if needed
5. **User Experience**: Consistent time display across all features

## Future Enhancements

1. **Multiple Timezones**: Easy to extend for multiple timezone support
2. **User Preferences**: Can add user-specific timezone preferences
3. **Daylight Saving**: Framework ready for DST handling if needed
4. **Internationalization**: Time formatting can be localized

## Troubleshooting

### Common Issues

1. **Times showing incorrectly**
   - Check if `templateHelpers` are properly loaded in middleware
   - Verify `convertISTToUTC` is used for user inputs

2. **Test validation not working**
   - Ensure `hasTestStarted`/`hasTestEnded` functions are used
   - Check that stored times are in UTC

3. **Form inputs showing wrong values**
   - Use `getDateInput` and `getTimeInput` helpers
   - Verify the date format matches HTML input requirements

### Debug Tips

```javascript
// Add logging to check time conversions
console.log('UTC Time:', getCurrentUTC());
console.log('IST Time:', getCurrentIST());
console.log('Converted:', convertISTToUTC('2024-01-30', '14:30'));
```

## Conclusion

The timezone standardization ensures reliable time handling across different deployment environments while maintaining a consistent user experience with IST display throughout the application.