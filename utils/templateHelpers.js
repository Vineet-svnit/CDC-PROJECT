/**
 * Template Helper Functions for EJS views
 * Provides time formatting functions for frontend display
 */

const {
    formatDateIST,
    formatTimeIST,
    formatDateTimeIST,
    getDateInputValue,
    getTimeInputValue,
    hasTestStarted,
    getCurrentUTC,
    convertUTCToIST,
    getTestStatus
} = require('./timeUtils');

/**
 * Template helpers to be used in EJS views
 */
const templateHelpers = {
    // Format date for display (IST)
    formatDate: (date) => formatDateIST(date),
    
    // Format time for display (IST)
    formatTime: (date) => formatTimeIST(date),
    
    // Format datetime for display (IST)
    formatDateTime: (date) => formatDateTimeIST(date),
    
    // Get date value for HTML date input (IST)
    getDateInput: (date) => getDateInputValue(date),
    
    // Get time value for HTML time input (IST)
    getTimeInput: (date) => getTimeInputValue(date),
    
    // Check if test has started
    hasStarted: (startTime) => hasTestStarted(startTime),
    
    // Get current year for copyright
    getCurrentYear: () => new Date().getFullYear(),
    
    // Convert UTC to IST for display
    toIST: (utcDate) => convertUTCToIST(utcDate),
    
    // Get current UTC time
    now: () => getCurrentUTC(),
    
    // Get test status (upcoming/active/completed)
    getTestStatus: (startTime, endTime) => getTestStatus(startTime, endTime),
    
    // Get current UTC time for comparisons
    getCurrentUTC: () => getCurrentUTC()
};

module.exports = templateHelpers;