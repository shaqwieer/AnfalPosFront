// Date formatting utility
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    // Format: DD/MM/YYYY or MM/DD/YYYY based on locale
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    return '-';
  }
};

// Date and time formatting utility
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString(undefined, options);
  } catch (error) {
    return '-';
  }
};

// Relative time formatting (e.g., "2 days ago")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    return '-';
  }
};

// Phone number formatting utility
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '-';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length >= 8) {
    // International format
    return `+${cleaned.slice(0, -10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  return phoneNumber; // Return original if can't format
};

// Text truncation utility
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Name initials utility
export const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return '?';
};

// Contact info validation utility
export const validateContactInfo = (contactInfo) => {
  if (!contactInfo) return { isValid: true, type: null };
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(contactInfo)) {
    return { isValid: true, type: 'email' };
  }
  
  // Phone validation (basic)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = contactInfo.replace(/[\s\-\(\)]/g, '');
  if (phoneRegex.test(cleanPhone)) {
    return { isValid: true, type: 'phone' };
  }
  
  // URL validation
  try {
    new URL(contactInfo);
    return { isValid: true, type: 'url' };
  } catch {
    // Not a URL
  }
  
  // Default to text
  return { isValid: true, type: 'text' };
};

// Contact info display utility
export const formatContactInfo = (contactInfo) => {
  if (!contactInfo) return '-';
  
  const validation = validateContactInfo(contactInfo);
  
  switch (validation.type) {
    case 'email':
      return contactInfo;
    case 'phone':
      return formatPhoneNumber(contactInfo);
    case 'url':
      return contactInfo;
    default:
      return contactInfo;
  }
};

// Status badge utility
export const getStatusSeverity = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'enabled':
    case 'online':
      return 'success';
    case 'inactive':
    case 'disabled':
    case 'offline':
      return 'danger';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'draft':
    case 'partial':
      return 'info';
    default:
      return 'secondary';
  }
};

// Number formatting utility
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) return '-';
  
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

// Export all utilities
export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPhoneNumber,
  truncateText,
  getInitials,
  validateContactInfo,
  formatContactInfo,
  getStatusSeverity,
  formatNumber
};