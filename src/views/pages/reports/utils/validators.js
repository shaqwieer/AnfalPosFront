/**
 * Validation utilities for report filters and forms
 */

/**
 * Validate report filters based on filter configuration
 * @param {Array} filters - Array of filter configurations
 * @param {Object} values - Current filter values
 * @returns {Object} Validation result with isValid flag and errors object
 */
export const validateFilters = (filters, values) => {
  const errors = {};
  let isValid = true;

  if (!filters || !Array.isArray(filters)) {
    return { isValid: true, errors: {} };
  }

  filters.forEach(filter => {
    const fieldErrors = validateFilter(filter, values);
    if (fieldErrors.length > 0) {
      errors[filter.name] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Validate a single filter
 * @param {Object} filter - Filter configuration
 * @param {Object} values - Current filter values
 * @returns {Array} Array of error messages
 */
export const validateFilter = (filter, values) => {
  const errors = [];
  
  if (filter.type === 'daterange') {
    const startValue = values[filter.startDate];
    const endValue = values[filter.endDate];
    
    // Check required fields
    if (filter.required) {
      if (!startValue) {
        errors.push(`${filter.label} start date is required`);
      }
      if (!endValue) {
        errors.push(`${filter.label} end date is required`);
      }
    }
    
    // Validate date range logic
    if (startValue && endValue) {
      const start = new Date(startValue);
      const end = new Date(endValue);
      
      if (start > end) {
        errors.push(`${filter.label} start date must be before end date`);
      }
      
      // Check maximum date range if specified
      if (filter.maxRangeDays) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > filter.maxRangeDays) {
          errors.push(`${filter.label} range cannot exceed ${filter.maxRangeDays} days`);
        }
      }
    }
  } else {
    const value = values[filter.name];
    
    // Check required fields
    if (filter.required && !hasValue(value)) {
      errors.push(`${filter.label} is required`);
    }
    
    // Type-specific validation
    if (hasValue(value)) {
      switch (filter.type) {
        case 'date':
          if (!isValidDate(value)) {
            errors.push(`${filter.label} must be a valid date`);
          }
          break;
          
        case 'number':
          if (!isValidNumber(value)) {
            errors.push(`${filter.label} must be a valid number`);
          } else {
            const numValue = parseFloat(value);
            if (filter.min !== undefined && numValue < filter.min) {
              errors.push(`${filter.label} must be at least ${filter.min}`);
            }
            if (filter.max !== undefined && numValue > filter.max) {
              errors.push(`${filter.label} must be at most ${filter.max}`);
            }
          }
          break;
          
        case 'email':
          if (!isValidEmail(value)) {
            errors.push(`${filter.label} must be a valid email address`);
          }
          break;
          
        case 'text':
          if (filter.minLength && value.length < filter.minLength) {
            errors.push(`${filter.label} must be at least ${filter.minLength} characters`);
          }
          if (filter.maxLength && value.length > filter.maxLength) {
            errors.push(`${filter.label} must be at most ${filter.maxLength} characters`);
          }
          if (filter.pattern && !new RegExp(filter.pattern).test(value)) {
            errors.push(`${filter.label} format is invalid`);
          }
          break;
          
        case 'multiselect':
          if (Array.isArray(value)) {
            if (filter.minSelections && value.length < filter.minSelections) {
              errors.push(`${filter.label} must have at least ${filter.minSelections} selections`);
            }
            if (filter.maxSelections && value.length > filter.maxSelections) {
              errors.push(`${filter.label} must have at most ${filter.maxSelections} selections`);
            }
          }
          break;
      }
    }
  }
  
  return errors;
};

/**
 * Check if a value exists and is not empty
 * @param {any} value - Value to check
 * @returns {boolean} True if value exists and is not empty
 */
export const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Validate if a value is a valid date
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (value) => {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  
  return false;
};

/**
 * Validate if a value is a valid number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value) => {
  if (typeof value === 'number') return !isNaN(value) && isFinite(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  }
  return false;
};

/**
 * Validate if a value is a valid email
 * @param {string} value - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (value) => {
  if (typeof value !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

/**
 * Validate if a value is a valid URL
 * @param {string} value - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (value) => {
  if (typeof value !== 'string') return false;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate if a value is a valid phone number (basic validation)
 * @param {string} value - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (value) => {
  if (typeof value !== 'string') return false;
  
  // Basic phone number regex (allows various formats)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = value.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleaned);
};

/**
 * Validate if a value matches a specific pattern
 * @param {string} value - Value to validate
 * @param {string|RegExp} pattern - Pattern to match against
 * @returns {boolean} True if value matches pattern
 */
export const matchesPattern = (value, pattern) => {
  if (typeof value !== 'string') return false;
  
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return regex.test(value);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with strength score and feedback
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    forbidCommonWords = true
  } = options;

  const feedback = [];
  let score = 0;

  // Length check
  if (password.length < minLength) {
    feedback.push(`Password must be at least ${minLength} characters long`);
  } else {
    score += 1;
  }

  // Character type checks
  if (requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else if (requireUppercase) {
    score += 1;
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else if (requireLowercase) {
    score += 1;
  }

  if (requireNumbers && !/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else if (requireNumbers) {
    score += 1;
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else if (requireSpecialChars) {
    score += 1;
  }

  // Common words check
  if (forbidCommonWords) {
    const commonWords = ['password', '123456', 'admin', 'user', 'login'];
    const lowerPassword = password.toLowerCase();
    
    if (commonWords.some(word => lowerPassword.includes(word))) {
      feedback.push('Password should not contain common words');
    } else {
      score += 1;
    }
  }

  // Calculate strength
  const maxScore = 5 + (forbidCommonWords ? 1 : 0);
  const strengthPercentage = (score / maxScore) * 100;
  
  let strength = 'weak';
  if (strengthPercentage >= 80) strength = 'strong';
  else if (strengthPercentage >= 60) strength = 'medium';

  return {
    isValid: feedback.length === 0,
    strength,
    score: strengthPercentage,
    feedback
  };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
    requireExtension = false
  } = options;

  const errors = [];

  // File existence check
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  // Size validation
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // MIME type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension && requireExtension) {
      errors.push('File must have an extension');
    } else if (fileExtension && !allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension .${fileExtension} is not allowed`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
  };
};

/**
 * Validate form data against a schema
 * @param {Object} data - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export const validateFormData = (data, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = data[field];
    const fieldErrors = [];

    // Required validation
    if (rules.required && !hasValue(value)) {
      fieldErrors.push(`${rules.label || field} is required`);
    }

    // Type validation (if value exists)
    if (hasValue(value)) {
      if (rules.type === 'email' && !isValidEmail(value)) {
        fieldErrors.push(`${rules.label || field} must be a valid email`);
      }
      
      if (rules.type === 'number' && !isValidNumber(value)) {
        fieldErrors.push(`${rules.label || field} must be a valid number`);
      }
      
      if (rules.type === 'date' && !isValidDate(value)) {
        fieldErrors.push(`${rules.label || field} must be a valid date`);
      }
      
      if (rules.type === 'url' && !isValidUrl(value)) {
        fieldErrors.push(`${rules.label || field} must be a valid URL`);
      }

      // String length validation
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          fieldErrors.push(`${rules.label || field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          fieldErrors.push(`${rules.label || field} must be at most ${rules.maxLength} characters`);
        }
      }

      // Number range validation
      if (rules.type === 'number' && isValidNumber(value)) {
        const numValue = parseFloat(value);
        if (rules.min !== undefined && numValue < rules.min) {
          fieldErrors.push(`${rules.label || field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && numValue > rules.max) {
          fieldErrors.push(`${rules.label || field} must be at most ${rules.max}`);
        }
      }

      // Custom validation function
      if (rules.validate && typeof rules.validate === 'function') {
        const customResult = rules.validate(value, data);
        if (customResult !== true && typeof customResult === 'string') {
          fieldErrors.push(customResult);
        }
      }

      // Pattern validation
      if (rules.pattern && !matchesPattern(value, rules.pattern)) {
        fieldErrors.push(rules.patternMessage || `${rules.label || field} format is invalid`);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize form input
 * @param {string} input - Input to validate and sanitize
 * @param {Object} options - Validation options
 * @returns {Object} Validation and sanitization result
 */
export const validateAndSanitizeInput = (input, options = {}) => {
  const {
    required = false,
    maxLength = null,
    pattern = null,
    sanitize = true
  } = options;

  const errors = [];
  
  // Required check
  if (required && !hasValue(input)) {
    errors.push('This field is required');
  }

  if (hasValue(input)) {
    const strInput = String(input);
    
    // Length check
    if (maxLength && strInput.length > maxLength) {
      errors.push(`Must be at most ${maxLength} characters`);
    }
    
    // Pattern check
    if (pattern && !matchesPattern(strInput, pattern)) {
      errors.push('Invalid format');
    }
  }

  const sanitizedValue = sanitize && typeof input === 'string' 
    ? sanitizeInput(input) 
    : input;

  return {
    isValid: errors.length === 0,
    errors,
    value: sanitizedValue
  };
};

/**
 * Create validation schema for common report filters
 * @returns {Object} Validation schema for report filters
 */
export const createReportFilterSchema = () => {
  return {
    dateRange: {
      validate: (value, allValues) => {
        if (!value || !value.startDate || !value.endDate) {
          return 'Date range is required';
        }
        
        const start = new Date(value.startDate);
        const end = new Date(value.endDate);
        
        if (start > end) {
          return 'Start date must be before end date';
        }
        
        // Max 1 year range
        const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
        if (end - start > maxRange) {
          return 'Date range cannot exceed 1 year';
        }
        
        return true;
      }
    },
    branchId: {
      required: true,
      label: 'Branch'
    },
    reportType: {
      required: true,
      label: 'Report Type'
    }
  };
};

// Export commonly used validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^[0-9]+$/,
  decimal: /^\d+(\.\d+)?$/,
  url: /^https?:\/\/.+/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
};