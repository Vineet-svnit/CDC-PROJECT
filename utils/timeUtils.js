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
 * Check if test is in buffer period (5 minutes before start time)
 * @param {Date} startTime - Test start time (UTC)
 * @returns {boolean} True if in buffer period
 */
const isInBufferPeriod = (startTime) => {
    const now = getCurrentUTC();
    const bufferStart = new Date(startTime.getTime() - (5 * 60 * 1000)); // 5 minutes before
    return now >= bufferStart && now < startTime;
};

/**
 * Check if test can be accessed (buffer period or after start time, but before end time)
 * @param {Date} startTime - Test start time (UTC)
 * @param {Date} endTime - Test end time (UTC)
 * @returns {boolean} True if test can be accessed
 */
const canAccessTest = (startTime, endTime) => {
    const now = getCurrentUTC();
    const bufferStart = new Date(startTime.getTime() - (5 * 60 * 1000)); // 5 minutes before
    return now >= bufferStart && now <= endTime;
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
 * @returns {string} 'upcoming', 'buffer', 'active', or 'completed'
 */
const getTestStatus = (startTime, endTime) => {
    const now = getCurrentUTC();
    const bufferStart = new Date(startTime.getTime() - (5 * 60 * 1000)); // 5 minutes before
    
    if (now < bufferStart) return 'upcoming';
    if (now >= bufferStart && now < startTime) return 'buffer';
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

/**
 * Get current academic year based on May 30 cutoff
 * Academic year runs from May 30 to May 30 of next year
 * Example: May 30, 2024 to May 29, 2025 = Academic Year 2024
 * @returns {number} Current academic year (e.g., 2024)
 */
const getCurrentAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = January, 4 = May)
    const currentDay = now.getDate();
    
    // If before May 30, we're still in previous academic year
    // If on or after May 30, we're in current academic year
    if (currentMonth < 4 || (currentMonth === 4 && currentDay < 30)) {
        // Before May 30 - still in previous academic year
        return currentYear - 1;
    } else {
        // On or after May 30 - in current academic year
        return currentYear;
    }
};

/**
 * Calculate academic year from admission year in email
 * @param {string} email - User email (e.g., u24cs001@coed.svnit.ac.in)
 * @returns {number} Academic year (e.g., 2024)
 */
const getAcademicYearFromEmail = (email) => {
    const username = email.split('@')[0].toLowerCase();
    const yearMatch = username.match(/^[a-z](\d{2})/);
    
    if (!yearMatch) {
        throw new Error('Invalid email format - cannot extract year');
    }
    
    const yearFromEmail = parseInt(yearMatch[1]);
    // Convert 2-digit year to 4-digit (e.g., 24 -> 2024)
    const admissionYear = yearFromEmail < 50 ? 2000 + yearFromEmail : 1900 + yearFromEmail;
    
    return admissionYear;
};

/**
 * Calculate user's current academic year level (1st year, 2nd year, etc.)
 * Based on admission year and current academic year
 * @param {number} admissionYear - Year user was admitted (e.g., 2024)
 * @returns {number} Current year level (1, 2, 3, 4, 5)
 */
const calculateYearLevel = (admissionYear) => {
    const currentAcademicYear = getCurrentAcademicYear();
    const yearLevel = currentAcademicYear - admissionYear + 1;
    
    // Ensure year level is at least 1
    return Math.max(1, yearLevel);
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
    isInBufferPeriod,
    canAccessTest,
    getTestStatus,
    getAnnouncementDate,
    getCurrentAcademicYear,
    getAcademicYearFromEmail,
    calculateYearLevel,
    IST_TIMEZONE
};