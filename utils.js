/**
 * Utility functions for Marker extension
 */

/**
 * Escape a value for CSV format
 * Handles quotes, commas, and newlines according to RFC 4180
 * @param {string} value - The value to escape
 * @returns {string} - The escaped value
 */
function escapeCSV(value) {
  if (value == null) return '';

  const stringValue = String(value);

  // If value contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }

  return stringValue;
}

/**
 * Format current date and time as ISO 8601 string
 * @returns {string} - ISO 8601 formatted datetime
 */
function formatISODateTime() {
  return new Date().toISOString();
}

/**
 * Convert seconds to HH:MM:SS format
 * @param {number} totalSeconds - Total seconds
 * @returns {string} - Formatted timestamp (HH:MM:SS)
 */
function formatTimestamp(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}

/**
 * Create a CSV row from bookmark data
 * @param {Object} data - Bookmark data object
 * @returns {string} - CSV row string
 */
function createCSVRow(data) {
  const fields = [
    data.video_id,
    data.video_title,
    data.channel_name,
    data.timestamp_seconds,
    data.timestamp_hh_mm_ss,
    data.video_url,
    data.created_at
  ];

  return fields.map(escapeCSV).join(',');
}

/**
 * Get the CSV header row
 * @returns {string} - CSV header string
 */
function getCSVHeader() {
  return 'video_id,video_title,channel_name,timestamp_seconds,timestamp_hh_mm_ss,video_url,created_at';
}

/**
 * Generate a simple UUID v4
 * @returns {string} - UUID string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeCSV,
    formatISODateTime,
    formatTimestamp,
    createCSVRow,
    getCSVHeader,
    generateUUID
  };
}
