// utils/formatters.js

/**
 * Format values based on type and options
 * @param {any} value - Value to format
 * @param {string} type - Value type (text, number, currency, date, boolean, etc.)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted value
 */
export const formatValue = (value, type, options = {}) => {
  if (value === null || value === undefined) {
    return options.nullDisplay || '-';
  }

  try {
    switch (type) {
      case 'currency':
        return formatCurrency(value, options);
      case 'number':
        return formatNumber(value, options);
      case 'date':
        return formatDate(value, options);
      case 'datetime':
        return formatDateTime(value, options);
      case 'boolean':
        return formatBoolean(value, options);
      case 'status':
        return formatStatus(value, options);
      case 'email':
        return formatEmail(value, options);
      case 'url':
        return formatUrl(value, options);
      case 'phone':
        return formatPhone(value, options);
      case 'percentage':
        return formatPercentage(value, options);
      case 'text':
      default:
        return formatText(value, options);
    }
  } catch (error) {
    console.warn('Error formatting value:', error);
    return String(value);
  }
};

/**
 * Format currency values
 * @param {number|string} value - Currency value
 * @param {Object} options - Currency format options
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value, options = {}) => {
  const {
    currency = 'SAR',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return String(value);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(numericValue);
};

/**
 * Format numeric values
 * @param {number|string} value - Numeric value
 * @param {Object} options - Number format options
 * @returns {string} Formatted number
 */
export const formatNumber = (value, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 3,
    useGrouping = true
  } = options;

  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return String(value);

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(numericValue);
};

/**
 * Format date values
 * @param {Date|string} value - Date value
 * @param {Object} options - Date format options
 * @returns {string} Formatted date
 */
export const formatDate = (value, options = {}) => {
  const {
    locale = 'en-US',
    format = 'short', // short, medium, long, full
    customFormat = null
  } = options;

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    return String(value);
  }

  if (isNaN(date.getTime())) return String(value);

  if (customFormat) {
    return formatDateCustom(date, customFormat);
  }

  const formatOptions = getDateFormatOptions(format);
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
};

/**
 * Format datetime values
 * @param {Date|string} value - DateTime value
 * @param {Object} options - DateTime format options
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (value, options = {}) => {
  const {
    locale = 'en-US',
    dateFormat = 'short',
    timeFormat = 'short'
  } = options;

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    return String(value);
  }

  if (isNaN(date.getTime())) return String(value);

  const formatOptions = {
    ...getDateFormatOptions(dateFormat),
    ...getTimeFormatOptions(timeFormat)
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
};

/**
 * Format boolean values
 * @param {boolean|string} value - Boolean value
 * @param {Object} options - Boolean format options
 * @returns {string} Formatted boolean
 */
export const formatBoolean = (value, options = {}) => {
  const {
    trueLabel = 'Yes',
    falseLabel = 'No',
    nullLabel = '-'
  } = options;

  if (value === null || value === undefined) return nullLabel;

  const boolValue = Boolean(value);
  return boolValue ? trueLabel : falseLabel;
};

/**
 * Format status values
 * @param {string} value - Status value
 * @param {Object} options - Status format options
 * @returns {string} Formatted status
 */
export const formatStatus = (value, options = {}) => {
  const {
    capitalize = true,
    statusMap = {}
  } = options;

  if (!value) return String(value);

  let formattedValue = String(value);

  // Apply custom status mapping if provided
  if (statusMap[value]) {
    formattedValue = statusMap[value];
  }

  // Capitalize if requested
  if (capitalize) {
    formattedValue = formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1).toLowerCase();
  }

  return formattedValue;
};

/**
 * Format email values
 * @param {string} value - Email value
 * @param {Object} options - Email format options
 * @returns {string} Formatted email
 */
export const formatEmail = (value, options = {}) => {
  const { maxLength = 50 } = options;

  if (!value) return String(value);

  const email = String(value).trim();
  
  if (email.length > maxLength) {
    return email.substring(0, maxLength - 3) + '...';
  }

  return email;
};

/**
 * Format URL values
 * @param {string} value - URL value
 * @param {Object} options - URL format options
 * @returns {string} Formatted URL
 */
export const formatUrl = (value, options = {}) => {
  const { maxLength = 50, showProtocol = false } = options;

  if (!value) return String(value);

  let url = String(value).trim();

  // Remove protocol if not requested
  if (!showProtocol) {
    url = url.replace(/^https?:\/\//, '');
  }

  if (url.length > maxLength) {
    return url.substring(0, maxLength - 3) + '...';
  }

  return url;
};

/**
 * Format phone values
 * @param {string} value - Phone value
 * @param {Object} options - Phone format options
 * @returns {string} Formatted phone
 */
export const formatPhone = (value, options = {}) => {
  const { format = 'international' } = options;

  if (!value) return String(value);

  const phone = String(value).replace(/\D/g, ''); // Remove non-digits

  if (format === 'international' && phone.length >= 10) {
    // Format as +X (XXX) XXX-XXXX
    const countryCode = phone.substring(0, phone.length - 10);
    const areaCode = phone.substring(phone.length - 10, phone.length - 7);
    const firstPart = phone.substring(phone.length - 7, phone.length - 4);
    const lastPart = phone.substring(phone.length - 4);

    return `+${countryCode} (${areaCode}) ${firstPart}-${lastPart}`;
  }

  return value;
};

/**
 * Format percentage values
 * @param {number|string} value - Percentage value
 * @param {Object} options - Percentage format options
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    multiplier = 1 // Set to 100 if value is decimal (0.15 = 15%)
  } = options;

  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return String(value);

  const adjustedValue = numericValue * multiplier;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(adjustedValue / 100);
};

/**
 * Format text values
 * @param {string} value - Text value
 * @param {Object} options - Text format options
 * @returns {string} Formatted text
 */
export const formatText = (value, options = {}) => {
  const {
    maxLength = null,
    capitalize = false,
    trim = true
  } = options;

  if (!value) return String(value);

  let text = String(value);

  if (trim) {
    text = text.trim();
  }

  if (capitalize) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + '...';
  }

  return text;
};

/**
 * Get date format options for Intl.DateTimeFormat
 * @param {string} format - Format type
 * @returns {Object} Format options
 */
const getDateFormatOptions = (format) => {
  switch (format) {
    case 'short':
      return {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
    case 'medium':
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
    case 'long':
      return {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
    case 'full':
      return {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
    default:
      return {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
  }
};

/**
 * Get time format options for Intl.DateTimeFormat
 * @param {string} format - Format type
 * @returns {Object} Format options
 */
const getTimeFormatOptions = (format) => {
  switch (format) {
    case 'short':
      return {
        hour: '2-digit',
        minute: '2-digit'
      };
    case 'medium':
      return {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
    case 'long':
      return {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
    default:
      return {
        hour: '2-digit',
        minute: '2-digit'
      };
  }
};

/**
 * Format date with custom format string
 * @param {Date} date - Date object
 * @param {string} format - Custom format string (YYYY-MM-DD, DD/MM/YYYY, etc.)
 * @returns {string} Formatted date
 */
const formatDateCustom = (date, format) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @param {Object} options - Format options
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, options = {}) => {
  const { decimals = 2 } = options;

  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format duration in milliseconds to human readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @param {Object} options - Format options
 * @returns {string} Formatted duration
 */
export const formatDuration = (milliseconds, options = {}) => {
  const { format = 'short' } = options;

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (format === 'short') {
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Long format
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);

  return parts.join(', ') || '0 seconds';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format array values as comma-separated string
 * @param {Array} value - Array value
 * @param {Object} options - Format options
 * @returns {string} Formatted array
 */
export const formatArray = (value, options = {}) => {
  const { separator = ', ', maxItems = null } = options;

  if (!Array.isArray(value)) return String(value);

  let items = value;
  if (maxItems && items.length > maxItems) {
    items = items.slice(0, maxItems);
    items.push(`... +${value.length - maxItems} more`);
  }

  return items.join(separator);
};

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path
 * @returns {any} Nested value
 */
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};