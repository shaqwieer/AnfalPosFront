/**
 * Utility functions for formatting values in reports
 */

// Default locale and currency settings
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

// Number formatter instances for better performance
const numberFormatter = new Intl.NumberFormat(DEFAULT_LOCALE);
const currencyFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: 'currency',
  currency: DEFAULT_CURRENCY
});

/**
 * Format a value based on its type
 * @param {any} value - The value to format
 * @param {string} format - The format type (currency, number, date, percentage, etc.)
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted value
 */
export const formatValue = (value, format, options = {}) => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === '') {
    return options.emptyValue || '-';
  }

  try {
    switch (format) {
      case 'currency':
        return formatCurrency(value, options);
      
      case 'number':
        return formatNumber(value, options);
      
      case 'percentage':
        return formatPercentage(value, options);
      
      case 'date':
        return formatDate(value, options);
      
      case 'datetime':
        return formatDateTime(value, options);
      
      case 'time':
        return formatTime(value, options);
      
      case 'boolean':
        return formatBoolean(value, options);
      
      case 'status':
        return formatStatus(value, options);
      
      case 'filesize':
        return formatFileSize(value, options);
      
      case 'duration':
        return formatDuration(value, options);
      
      case 'text':
      default:
        return formatText(value, options);
    }
  } catch (error) {
    console.warn(`Failed to format value "${value}" as "${format}":`, error);
    return String(value);
  }
};

/**
 * Format currency values
 * @param {number|string} value - The numeric value
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value, options = {}) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return options.emptyValue || '-';

  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options;

  if (!showSymbol) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(numValue);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(numValue);
};

/**
 * Format numeric values
 * @param {number|string} value - The numeric value
 * @param {object} options - Formatting options
 * @returns {string} Formatted number
 */
export const formatNumber = (value, options = {}) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return options.emptyValue || '-';

  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
    compact = false
  } = options;

  if (compact) {
    return formatCompactNumber(numValue, locale);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(numValue);
};

/**
 * Format percentage values
 * @param {number|string} value - The numeric value (0-1 or 0-100)
 * @param {object} options - Formatting options
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, options = {}) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return options.emptyValue || '-';

  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 1,
    maximumFractionDigits = 2,
    isDecimal = false // true if value is 0-1, false if 0-100
  } = options;

  const percentage = isDecimal ? numValue : numValue / 100;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(percentage);
};

/**
 * Format date values
 * @param {Date|string|number} value - The date value
 * @param {object} options - Formatting options
 * @returns {string} Formatted date
 */
export const formatDate = (value, options = {}) => {
  const date = parseDate(value);
  if (!date) return options.emptyValue || '-';

  const {
    locale = DEFAULT_LOCALE,
    dateStyle = 'medium',
    format = null
  } = options;

  if (format) {
    return formatCustomDate(date, format);
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle
  }).format(date);
};

/**
 * Format datetime values
 * @param {Date|string|number} value - The datetime value
 * @param {object} options - Formatting options
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (value, options = {}) => {
  const date = parseDate(value);
  if (!date) return options.emptyValue || '-';

  const {
    locale = DEFAULT_LOCALE,
    dateStyle = 'medium',
    timeStyle = 'short'
  } = options;

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle
  }).format(date);
};

/**
 * Format time values
 * @param {Date|string|number} value - The time value
 * @param {object} options - Formatting options
 * @returns {string} Formatted time
 */
export const formatTime = (value, options = {}) => {
  const date = parseDate(value);
  if (!date) return options.emptyValue || '-';

  const {
    locale = DEFAULT_LOCALE,
    timeStyle = 'short',
    hour12 = true
  } = options;

  return new Intl.DateTimeFormat(locale, {
    timeStyle,
    hour12
  }).format(date);
};

/**
 * Format boolean values
 * @param {boolean|string|number} value - The boolean value
 * @param {object} options - Formatting options
 * @returns {string} Formatted boolean
 */
export const formatBoolean = (value, options = {}) => {
  const {
    trueText = 'Yes',
    falseText = 'No',
    nullText = '-'
  } = options;

  if (value === null || value === undefined) return nullText;
  
  const boolValue = Boolean(value);
  return boolValue ? trueText : falseText;
};

/**
 * Format status values with appropriate styling
 * @param {string} value - The status value
 * @param {object} options - Formatting options
 * @returns {string} Formatted status
 */
export const formatStatus = (value, options = {}) => {
  if (!value) return options.emptyValue || '-';

  const {
    capitalize = true,
    statusMap = null
  } = options;

  let formatted = String(value);

  // Apply custom status mapping if provided
  if (statusMap && statusMap[value]) {
    formatted = statusMap[value];
  }

  // Capitalize if requested
  if (capitalize) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
  }

  return formatted;
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @param {object} options - Formatting options
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, options = {}) => {
  const numBytes = parseInt(bytes);
  if (isNaN(numBytes) || numBytes < 0) return options.emptyValue || '-';

  const { precision = 1 } = options;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  if (numBytes === 0) return '0 B';
  
  const unitIndex = Math.floor(Math.log(numBytes) / Math.log(1024));
  const size = numBytes / Math.pow(1024, unitIndex);
  
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

/**
 * Format duration in milliseconds to human readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @param {object} options - Formatting options
 * @returns {string} Formatted duration
 */
export const formatDuration = (milliseconds, options = {}) => {
  const ms = parseInt(milliseconds);
  if (isNaN(ms) || ms < 0) return options.emptyValue || '-';

  const {
    format = 'auto', // 'auto', 'short', 'long'
    showSeconds = true,
    showMilliseconds = false
  } = options;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (format === 'short') {
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${showSeconds ? `${seconds % 60}s` : ''}`;
    if (showSeconds) return `${seconds}s`;
    if (showMilliseconds) return `${ms}ms`;
    return '0s';
  }

  if (format === 'long') {
    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
    if (showSeconds && seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : '0 seconds';
  }

  // Auto format
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${showSeconds ? `${seconds % 60}s` : ''}`;
  return showSeconds ? `${seconds}s` : `${minutes}m`;
};

/**
 * Format text with various options
 * @param {string} value - The text value
 * @param {object} options - Formatting options
 * @returns {string} Formatted text
 */
export const formatText = (value, options = {}) => {
  if (!value && value !== 0) return options.emptyValue || '-';

  const {
    truncate = null,
    condition = null, // 'upper', 'lower', 'title', 'sentence'
    trim = true
  } = options;

  let formatted = String(value);

  if (trim) {
    formatted = formatted.trim();
  }

  // Apply case transformation
  switch (condition) {
    case 'upper':
      formatted = formatted.toUpperCase();
      break;
    case 'lower':
      formatted = formatted.toLowerCase();
      break;
    case 'title':
      formatted = formatted.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      break;
    case 'sentence':
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
      break;
  }

  // Apply truncation if specified
  if (truncate && formatted.length > truncate) {
    formatted = formatted.substring(0, truncate - 3) + '...';
  }

  return formatted;
};

/**
 * Format compact numbers (1K, 1M, 1B, etc.)
 * @param {number} value - The numeric value
 * @param {string} locale - The locale
 * @returns {string} Formatted compact number
 */
export const formatCompactNumber = (value, locale = DEFAULT_LOCALE) => {
  if (Math.abs(value) < 1000) {
    return numberFormatter.format(value);
  }

  // Try to use Intl.NumberFormat with compact notation if supported
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  } catch (error) {
    // Fallback for browsers that don't support compact notation
    const units = ['', 'K', 'M', 'B', 'T'];
    const unitIndex = Math.floor(Math.log10(Math.abs(value)) / 3);
    const scaledValue = value / Math.pow(1000, unitIndex);
    
    return `${scaledValue.toFixed(1)}${units[unitIndex]}`;
  }
};

/**
 * Parse various date formats into a Date object
 * @param {Date|string|number} value - The date value
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Try parsing as ISO string
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  // Try parsing as timestamp
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

/**
 * Format date with custom pattern
 * @param {Date} date - The date object
 * @param {string} pattern - The format pattern (YYYY-MM-DD, DD/MM/YYYY, etc.)
 * @returns {string} Formatted date
 */
export const formatCustomDate = (date, pattern) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return pattern
    .replace(/YYYY/g, year)
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
};

/**
 * Get the appropriate number formatter for a locale
 * @param {string} locale - The locale
 * @param {object} options - Formatting options
 * @returns {Intl.NumberFormat} Number formatter
 */
export const getNumberFormatter = (locale = DEFAULT_LOCALE, options = {}) => {
  return new Intl.NumberFormat(locale, options);
};

/**
 * Get the appropriate currency formatter for a locale and currency
 * @param {string} locale - The locale
 * @param {string} currency - The currency code
 * @param {object} options - Formatting options
 * @returns {Intl.NumberFormat} Currency formatter
 */
export const getCurrencyFormatter = (locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY, options = {}) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options
  });
};

// Export formatter configuration
export const formatterConfig = {
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY,
  numberFormatter,
  currencyFormatter
};