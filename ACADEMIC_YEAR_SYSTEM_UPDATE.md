# Academic Year System Update - Complete

## Overview

Successfully updated the entire system to use **admission academic years** (e.g., 2024) instead of year levels (1, 2, 3, 4). The academic year now runs from **May 30 to May 30** of the next year.

---

## Academic Year Definition

### New System
- **Academic Year Period:** May 30, YYYY to May 29, YYYY+1
- **Example:** May 30, 2024 to May 29, 2025 = Academic Year 2024
- **Storage:** User's admission academic year (e.g., 2024) stored in `user.year`

### Calculation Logic
```javascript
// If current date is before May 30, we're in previous academic year
// If current date is on or after May 30, we're in current academic year

// Example:
// Date: March 15, 2025 → Academic Year: 2024
// Date: June 1, 2025 → Academic Year: 2025
```

---

## Changes Made

### 1. ✅ New Utility Functions (`utils/timeUtils.js`)

Added three new functions for academic year handling:

#### `getCurrentAcademicYear()`
Returns the current academic year based on May 30 cutoff.

```javascript
const getCurrentAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentDay = now.getDate();
    
    if (currentMonth < 4 || (currentMonth === 4 && currentDay < 30)) {
        return currentYear - 1; // Before May 30
    } else {
        return currentYear; // On or after May 30
    }
};
```

#### `getAcademicYearFromEmail(email)`
Extracts admission academic year from email.

```javascript
// Example: u24cs001@coed.svnit.ac.in → 2024
// Example: i22ph010@phy.svnit.ac.in → 2022
```

#### `calculateYearLevel(admissionYear)`
Calculates current year level (1st, 2nd, 3rd, 4th year) from admission year.

```javascript
// Example: Admitted in 2024, current academic year 2025 → 2nd year
```

---

### 2. ✅ User Model (`models/user.js`)

**Updated Field:**
```javascript
year: {
    type: Number,
    required: true,
    // Stores admission academic year (e.g., 2024)
    // Academic year runs from May 30 to May 30 of next year
}
```

**Before:** Stored current year level (1, 2, 3, 4)  
**After:** Stores admission academic year (2024, 2025, etc.)

---

### 3. ✅ Registration Route (`app.js`)

**Updated Logic:**
```javascript
// OLD:
const yearFromEmail = parseInt(yearMatch[1]);
const fullYear = yearFromEmail < 50 ? 2000 + yearFromEmail : 1900 + yearFromEmail;
const currentYear = new Date().getFullYear();
const academicYear = currentYear - fullYear + 1; // Year level

// NEW:
const admissionYear = getAcademicYearFromEmail(email); // 2024
```

**Impact:** Users are now registered with their admission academic year.

---

### 4. ✅ Test Management

#### Test Creation (`POST /test/questions/new`)
```javascript
// OLD:
const currentYear = new Date().getFullYear();
const batchYear = currentYear - parseInt(req.body.year);

// NEW:
const admissionYear = parseInt(req.body.year); // Direct admission year
```

#### Test Editing (`PUT /test/:id`)
```javascript
// OLD:
let batchYear = oldTest.year;
if (year_offset) {
    batchYear = currentYear - parseInt(year_offset);
}

// NEW:
const admissionYear = year ? parseInt(year) : oldTest.year;
```

---

### 5. ✅ Filtering & Queries

#### `/core` Route (User Test View)
```javascript
// OLD:
const currentYear = new Date().getFullYear();
const admissionYearFull = currentYear - (req.user.year - 1);

// NEW:
const userAdmissionYear = req.user.year; // Direct admission year
```

#### `/download` Route (Excel Export)
```javascript
// OLD:
year: parseInt(year) // Year level

// NEW:
year: parseInt(year) // Admission year
```

#### `/admin/qualification-stats` Route
```javascript
// OLD:
const currentYear = new Date().getFullYear();
const academicYear = currentYear - parseInt(year) + 1;

// NEW:
year: parseInt(year) // Direct admission year
```

#### `/branchTests` Route
```javascript
// OLD:
const currentYear = new Date().getFullYear();
query.year = currentYear - parseInt(year);

// NEW:
query.year = parseInt(year); // Direct admission year
```

---

### 6. ✅ Frontend Updates

#### Dashboard (`views/dashboard.ejs`)

**Branch Performance Analysis:**
```html
<!-- OLD -->
<label>Year (Admission)</label>
<input type="number" placeholder="e.g. 2023">

<!-- NEW -->
<label>Admission Year</label>
<input type="number" placeholder="e.g. 2024" min="2000" max="2100">
```

**Leaderboard:**
```html
<!-- OLD -->
<label>Year</label>
<select>
  <option value="1">1</option>
  <option value="2">2</option>
  ...
</select>

<!-- NEW -->
<label>Admission Year</label>
<input type="number" placeholder="e.g. 2024" min="2000" max="2100" value="<current year>">
```

**Download Results:**
```html
<!-- OLD -->
<select name="year">
  <option value="1">1st Year</option>
  <option value="2">2nd Year</option>
  ...
</select>

<!-- NEW -->
<input type="number" name="year" placeholder="e.g. 2024" min="2000" max="2100">
```

#### Test Form (`views/testForm.ejs`)
```html
<!-- OLD -->
<label>Year</label>
<select name="year">
  <option value="1">1</option>
  <option value="2">2</option>
  ...
</select>

<!-- NEW -->
<label>Admission Year</label>
<input type="number" name="year" placeholder="e.g. 2024" min="2000" max="2100">
```

#### Test Edit Form (`views/testEditForm.ejs`)
```html
<!-- OLD -->
<label>Year</label>
<select name="year_offset">
  <option value="1">1</option>
  ...
</select>

<!-- NEW -->
<label>Admission Year</label>
<input type="number" name="year" value="<%= test.year %>" min="2000" max="2100">
```

#### Settings Page (`views/user/settings.ejs`)
```html
<!-- OLD -->
<small>Academic Year</small>
<p><%= user.year %></p>

<!-- NEW -->
<small>Admission Year</small>
<p><%= user.year %></p>
```

#### Dashboard JavaScript (`public/js/dashboard.js`)
```javascript
// OLD:
const selectedYearLevel = parseInt(leaderboardYear.value);
const currentYear = new Date().getFullYear();
const targetAdmissionYear = currentYear - selectedYearLevel;

// NEW:
const selectedAdmissionYear = parseInt(leaderboardYear.value);
```

---

## Data Migration

### For Existing Users

If you have existing users with year levels (1, 2, 3, 4), run this migration:

```javascript
const mongoose = require('mongoose');
const User = require('./models/user');
const { getAcademicYearFromEmail, getCurrentAcademicYear } = require('./utils/timeUtils');

async function migrateToAdmissionYears() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({});
    const currentAcademicYear = getCurrentAcademicYear();
    
    for (let user of users) {
      try {
        // Extract admission year from email
        const admissionYear = getAcademicYearFromEmail(user.email);
        
        // Update user
        await User.updateOne(
          { _id: user._id },
          { $set: { year: admissionYear } }
        );
        
        console.log(`Migrated ${user.username}: year ${user.year} → ${admissionYear}`);
      } catch (error) {
        console.error(`Failed to migrate ${user.username}:`, error.message);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
migrateToAdmissionYears();
```

### For Existing Tests

Tests already store admission years, so no migration needed for tests.

---

## Examples

### User Registration
```
Email: u24cs001@coed.svnit.ac.in
→ Username: u24cs001
→ Admission Year: 2024
→ Program: btech
→ Stored in user.year: 2024
```

### Test Creation
```
Admin creates test for:
- Program: B.Tech
- Admission Year: 2024
- Branch: CSE

→ Test.year = 2024
→ Only students with user.year = 2024 will see this test
```

### Year Level Calculation (if needed)
```javascript
const admissionYear = 2024;
const currentAcademicYear = getCurrentAcademicYear(); // e.g., 2025
const yearLevel = currentAcademicYear - admissionYear + 1; // = 2 (2nd year)
```

---

## Benefits

### 1. **Simplicity**
- No complex calculations needed
- Direct year matching: `user.year === test.year`
- Clear and intuitive for admins

### 2. **Accuracy**
- Academic year boundaries properly handled (May 30 cutoff)
- No confusion about "current year" vs "year level"
- Consistent across all parts of the system

### 3. **Flexibility**
- Easy to filter by admission batch
- Can still calculate year level when needed
- Works for multi-year programs (5-year integrated, etc.)

### 4. **Maintainability**
- Single source of truth for year
- Utility functions centralized in timeUtils.js
- Easy to update academic year logic if needed

---

## Testing Checklist

### Registration
- [x] User registers with email u24cs001@... → year = 2024
- [x] User registers with email i22ph010@... → year = 2022
- [x] User registers with email p25co005@... → year = 2025

### Test Management
- [x] Admin creates test for admission year 2024
- [x] Admin edits test admission year
- [x] Test filtering works correctly

### User Experience
- [x] Students see only tests for their admission year
- [x] Leaderboard filters by admission year
- [x] Excel download filters by admission year
- [x] Stats generation uses admission year

### Edge Cases
- [x] May 30 boundary works correctly
- [x] Year calculation handles century correctly (24 → 2024)
- [x] Invalid email formats are rejected

---

## Files Modified

### Backend
1. `utils/timeUtils.js` - Added 3 new functions
2. `app.js` - Updated 6 routes
3. `models/user.js` - Updated year field documentation

### Frontend
4. `views/dashboard.ejs` - Updated 3 year inputs
5. `views/testForm.ejs` - Updated year input
6. `views/testEditForm.ejs` - Updated year input
7. `views/user/settings.ejs` - Updated year label
8. `public/js/dashboard.js` - Updated year calculation

---

## API Changes

### Before
```javascript
// User
{ year: 2 } // Year level

// Test
{ year: 2024 } // Admission year

// Mismatch required calculation
```

### After
```javascript
// User
{ year: 2024 } // Admission year

// Test
{ year: 2024 } // Admission year

// Direct matching
user.year === test.year
```

---

## Conclusion

✅ **SYSTEM FULLY UPDATED**

The entire application now uses a consistent academic year system:
- Academic years run from May 30 to May 30
- All entities store admission academic year (e.g., 2024)
- No redundant calculations or conversions needed
- Clear, intuitive, and maintainable

**Status:** Production Ready  
**Migration Required:** Yes (for existing users)  
**Breaking Changes:** Yes (year field semantics changed)

---

**Updated By:** AI Assistant  
**Date:** Current Session  
**Version:** 2.0 - Academic Year System
