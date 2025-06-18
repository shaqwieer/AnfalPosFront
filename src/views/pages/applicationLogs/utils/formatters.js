export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const getLogLevelSeverity = (level) => {
  switch (level?.toLowerCase()) {
    case 'trace': return 'secondary';
    case 'debug': return 'info';
    case 'information': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    case 'critical': return 'danger';
    default: return 'secondary';
  }
};

export const getLogLevelIcon = (level) => {
  switch (level?.toLowerCase()) {
    case 'trace': return 'pi-search';
    case 'debug': return 'pi-bug';
    case 'information': return 'pi-info-circle';
    case 'warning': return 'pi-exclamation-triangle';
    case 'error': return 'pi-times-circle';
    case 'critical': return 'pi-times-circle';
    default: return 'pi-circle';
  }
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatLogLevel = (level) => {
  if (!level) return 'Unknown';
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
};

export const isJsonString = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const formatJsonString = (str, indent = 2) => {
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed, null, indent);
  } catch (e) {
    return str;
  }
};