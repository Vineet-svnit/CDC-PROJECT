/**
 * Time Utility Functions for standardized timezone handling
 * 
 * Standard: 
 * - All times stored in database as UTC
 * - All frontend displays converted to IST
 * - All user inputs treated as IST and converted to UTC for storage
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current time in IST
 * @returns {Date} Current time in IST
 */
const getCurrentIST = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
};

/**
 * Get current UTC time
 * @returns {Date} Current UTC time
 */
const getCurrentUTC = () => {
    return new Date();
};

/**
 * Convert IST datetime string to UTC Date object
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @param {string} timeString - Time string in format HH:MM
 * @returns {Date} UTC Date object
 */
const convertISTToUTC = (dateString, timeString) => {
    // Create IST datetime string
    const istDateTimeString = `${dateString}T${timeString}:00`;
    
    // Create a date object assuming IST timezone
    const istDate = new Date(istDateTimeString);
    
    // Get IST offset (IST is UTC+5:30, so offset is -330 minutes)
    const istOffset = 5.5 * 60; // 5 hours 30 minutes in minutes
    
    // Convert to UTC by subtracting IST offset
    const utcDate = new Date(istDate.getTime() - (istOffset * 60 * 1000));
    
    return utcDate;
};

/**
 * Convert UTC Date to IST Date object
 * @param {Date} utcDate - UTC Date object
 * @returns {Date} IST Date object
 */
const convertUTCToIST = (utcDate) => {
    return new Date(utcDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
};

/**
 * Format date for display in IST
 * @param {Date} date - Date object (UTC)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string in IST
 */
const formatDateIST = (date, options = {}) => {
    const defaultOptions = {
        timeZone: IST_TIMEZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return new Date(date).toLocaleDateString('en-GB', { ...defaultOptions, ...options });
};

/**
 * Format time for display in IST
 * @param {Date} date - Date object (UTC)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string in IST
 */
const formatTimeIST = (date, options = {}) => {
    const defaultOptions = {
        timeZone: IST_TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    return new Date(date).toLocaleTimeString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format datetime for display in IST
 * @param {Date} date - Date object (UTC)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted datetime string in IST
 */
const formatDateTimeIST = (date, options = {}) => {
    const defaultOptions = {
        timeZone: IST_TIMEZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
};

/**
 * Get date string for HTML date input (YYYY-MM-DD) in IST
 * @param {Date} date - Date object (UTC)
 * @returns {string} Date string in YYYY-MM-DD format (IST)
 */
const getDateInputValue = (date) => {
    const istDate = convertUTCToIST(date);
    return istDate.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
};

/**
 * Get time string for HTML time input (HH:MM) in IST
 * @param {Date} date - Date object (UTC)
 * @returns {string} Time string in HH:MM format (IST)
 */
const getTimeInputValue = (date) => {
    const istDate = convertUTCToIST(date);
    return istDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
};

/**
 * Check if a test is currently active (between start and end time)
 * @param {Date} startTime - Test start time (UTC)
 * @param {Date} endTime - Test end time (UTC)
 * @returns {boolean} True if test is active
 */
const isTestActive = (startTime, endTime) => {
    const now = getCurrentUTC();
    return now >= startTime && now <= endTime;
};

/**
 * Check if a test has started
 * @param {Date} startTime - Test start time (UTC)
 * @returns {boolean} True if test has started
 */
const hasTestStarted = (startTime) => {
    const now = getCurrentUTC();
    return now >= startTime;
};

/**
 * Check if a test has ended
 * @param {Date} endTime - Test end time (UTC)
 * @returns {boolean} True if test has ended
 */
const hasTestEnded = (endTime) => {
    const now = getCurrentUTC();
    return now > endTime;
};

/**
 * Get test status
 * @param {Date} startTime - Test start time (UTC)
 * @param {Date} endTime - Test end time (UTC)
 * @returns {string} 'upcoming', 'active', or 'completed'
 */
const getTestStatus = (startTime, endTime) => {
    const now = getCurrentUTC();
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
};

/**
 * Create a date for announcement (current date in IST)
 * @returns {string} Formatted date string for announcements
 */
const getAnnouncementDate = () => {
    const istDate = getCurrentIST();
    return istDate.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
};

module.exports = {
    getCurrentIST,
    getCurrentUTC,
    convertISTToUTC,
    convertUTCToIST,
    formatDateIST,
    formatTimeIST,
    formatDateTimeIST,
    getDateInputValue,
    getTimeInputValue,
    isTestActive,
    hasTestStarted,
    hasTestEnded,
    getTestStatus,
    getAnnouncementDate,
    IST_TIMEZONE
};