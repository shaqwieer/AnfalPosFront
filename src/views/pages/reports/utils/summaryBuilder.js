/**
 * Dynamic Summary Builder Utility
 * Builds summary cards from any data structure with aggregation operations
 */

import { formatValue } from './formatters';

/**
 * Build summary data from dataset based on card configurations
 * @param {Array} data - Source data array
 * @param {Array} cardConfigs - Array of summary card configurations
 * @param {Object} options - Additional options
 * @returns {Object} Summary data object
 */
export const buildSummaryData = (data, cardConfigs, options = {}) => {
  debugger;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return generateEmptySummary(cardConfigs);
  }

  if (!cardConfigs || !Array.isArray(cardConfigs)) {
    return {};
  }

  const summary = {};
  const {
    includeMetadata = true,
    customAggregators = {},
    filters = null
  } = options;

  // Apply filters if provided
  const filteredData = false ? applyFilters(data, filters) : data;

  // Process each card configuration
  cardConfigs.forEach(cardConfig => {
    try {
      const value = calculateSummaryValue(filteredData, cardConfig, customAggregators);
      summary[cardConfig.key] = value;

      // Add metadata if requested
      if (includeMetadata) {
        summary[`${cardConfig.key}_meta`] = {
          label: cardConfig.label,
          format: cardConfig.format,
          color: cardConfig.color,
          dataPoints: filteredData.length,
          calculation: cardConfig.aggregate
        };
      }
    } catch (error) {
      console.error(`Error calculating summary for ${cardConfig.key}:`, error);
      summary[cardConfig.key] = 0;
    }
  });

  // Add global metadata
  if (includeMetadata) {
    summary._metadata = {
      totalRecords: data.length,
      filteredRecords: filteredData.length,
      calculatedAt: new Date().toISOString(),
      hasFilters: !!filters
    };
  }

  return summary;
};

/**
 * Calculate summary value for a single card
 * @param {Array} data - Filtered data array
 * @param {Object} cardConfig - Card configuration
 * @param {Object} customAggregators - Custom aggregation functions
 * @returns {any} Calculated value
 */
const calculateSummaryValue = (data, cardConfig, customAggregators = {}) => {
  const { aggregate, defaultValue = 0 } = cardConfig;

  if (!aggregate) {
    console.warn(`No aggregate configuration found for card: ${cardConfig.key}`);
    return defaultValue;
  }

  // Handle custom aggregators
  if (aggregate.operation && customAggregators[aggregate.operation]) {
    return customAggregators[aggregate.operation](data, aggregate);
  }

  // Handle built-in aggregations
  switch (aggregate.operation) {
    case 'sum':
      return calculateSum(data, aggregate);
    
    case 'count':
      return calculateCount(data, aggregate);
    
    case 'countUnique':
      return calculateCountUnique(data, aggregate);
    
    case 'countTrue':
      return calculateCountTrue(data, aggregate);
    
    case 'countFalse':
      return calculateCountFalse(data, aggregate);
    
    case 'average':
    case 'avg':
      return calculateAverage(data, aggregate);
    
    case 'min':
      return calculateMin(data, aggregate);
    
    case 'max':
      return calculateMax(data, aggregate);
    
    case 'median':
      return calculateMedian(data, aggregate);
    
    case 'percentage':
      return calculatePercentage(data, aggregate);
    
    case 'ratio':
      return calculateRatio(data, aggregate);
    
    case 'growth':
      return calculateGrowth(data, aggregate);
    
    case 'custom':
      return calculateCustom(data, aggregate);
    
    default:
      console.warn(`Unsupported aggregation operation: ${aggregate.operation}`);
      return defaultValue;
  }
};

/**
 * Calculate sum aggregation
 */
const calculateSum = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  return filteredData.reduce((sum, item) => {
    const value = parseFloat(getNestedValue(item, field)) || 0;
    return sum + value;
  }, 0);
};

/**
 * Calculate count aggregation
 */
const calculateCount = (data, config) => {
  const { field = null, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  if (!field) {
    return filteredData.length;
  }
  
  return filteredData.filter(item => {
    const value = getNestedValue(item, field);
    return value !== null && value !== undefined && value !== '';
  }).length;
};

/**
 * Calculate unique count aggregation
 */
const calculateCountUnique = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  const uniqueValues = new Set();
  filteredData.forEach(item => {
    const value = getNestedValue(item, field);
    if (value !== null && value !== undefined && value !== '') {
      uniqueValues.add(value);
    }
  });
  
  return uniqueValues.size;
};

/**
 * Calculate count of true values
 */
const calculateCountTrue = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  return filteredData.filter(item => {
    const value = getNestedValue(item, field);
    return Boolean(value) === true;
  }).length;
};

/**
 * Calculate count of false values
 */
const calculateCountFalse = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  return filteredData.filter(item => {
    const value = getNestedValue(item, field);
    return Boolean(value) === false;
  }).length;
};

/**
 * Calculate average aggregation
 */
const calculateAverage = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  const values = filteredData
    .map(item => parseFloat(getNestedValue(item, field)))
    .filter(value => !isNaN(value));
  
  if (values.length === 0) return 0;
  
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};

/**
 * Calculate minimum value
 */
const calculateMin = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  const values = filteredData
    .map(item => parseFloat(getNestedValue(item, field)))
    .filter(value => !isNaN(value));
  
  return values.length > 0 ? Math.min(...values) : 0;
};

/**
 * Calculate maximum value
 */
const calculateMax = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  const values = filteredData
    .map(item => parseFloat(getNestedValue(item, field)))
    .filter(value => !isNaN(value));
  
  return values.length > 0 ? Math.max(...values) : 0;
};

/**
 * Calculate median value
 */
const calculateMedian = (data, config) => {
  const { field, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  const values = filteredData
    .map(item => parseFloat(getNestedValue(item, field)))
    .filter(value => !isNaN(value))
    .sort((a, b) => a - b);
  
  if (values.length === 0) return 0;
  
  const middle = Math.floor(values.length / 2);
  
  if (values.length % 2 === 0) {
    return (values[middle - 1] + values[middle]) / 2;
  }
  
  return values[middle];
};

/**
 * Calculate percentage
 */
const calculatePercentage = (data, config) => {
  const { numerator, denominator, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  const numeratorValue = calculateSum(filteredData, { field: numerator.field, conditions: numerator.conditions });
  const denominatorValue = calculateSum(filteredData, { field: denominator.field, conditions: denominator.conditions });
  
  if (denominatorValue === 0) return 0;
  
  return (numeratorValue / denominatorValue) * 100;
};

/**
 * Calculate ratio
 */
const calculateRatio = (data, config) => {
  const { numerator, denominator, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  const numeratorValue = calculateSum(filteredData, { field: numerator.field, conditions: numerator.conditions });
  const denominatorValue = calculateSum(filteredData, { field: denominator.field, conditions: denominator.conditions });
  
  if (denominatorValue === 0) return 0;
  
  return numeratorValue / denominatorValue;
};

/**
 * Calculate growth rate (requires date field)
 */
const calculateGrowth = (data, config) => {
  const { field, dateField, period = 'month', conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  // Group data by period
  const grouped = groupByPeriod(filteredData, dateField, period);
  const periods = Object.keys(grouped).sort();
  
  if (periods.length < 2) return 0;
  
  const currentPeriod = periods[periods.length - 1];
  const previousPeriod = periods[periods.length - 2];
  
  const currentValue = calculateSum(grouped[currentPeriod], { field });
  const previousValue = calculateSum(grouped[previousPeriod], { field });
  
  if (previousValue === 0) return 0;
  
  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * Calculate custom aggregation using provided function
 */
const calculateCustom = (data, config) => {
  const { customFunction, conditions = null } = config;
  const filteredData = conditions ? applyConditions(data, conditions) : data;
  
  if (typeof customFunction === 'function') {
    return customFunction(filteredData, config);
  }
  
  console.warn('Custom function not provided for custom aggregation');
  return 0;
};

/**
 * Apply conditions to filter data
 * @param {Array} data - Source data
 * @param {Array} conditions - Array of condition objects
 * @returns {Array} Filtered data
 */
const applyConditions = (data, conditions) => {
  if (!conditions || !Array.isArray(conditions)) return data;
  
  return data.filter(item => {
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const itemValue = getNestedValue(item, field);
      
      switch (operator) {
        case 'equals':
        case '==':
          return itemValue == value;
        
        case 'notEquals':
        case '!=':
          return itemValue != value;
        
        case 'greaterThan':
        case '>':
          return parseFloat(itemValue) > parseFloat(value);
        
        case 'lessThan':
        case '<':
          return parseFloat(itemValue) < parseFloat(value);
        
        case 'greaterThanOrEqual':
        case '>=':
          return parseFloat(itemValue) >= parseFloat(value);
        
        case 'lessThanOrEqual':
        case '<=':
          return parseFloat(itemValue) <= parseFloat(value);
        
        case 'contains':
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        
        case 'startsWith':
          return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase());
        
        case 'endsWith':
          return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase());
        
        case 'in':
          return Array.isArray(value) && value.includes(itemValue);
        
        case 'notIn':
          return Array.isArray(value) && !value.includes(itemValue);
        
        case 'isNull':
          return itemValue === null || itemValue === undefined;
        
        case 'isNotNull':
          return itemValue !== null && itemValue !== undefined;
        
        case 'isEmpty':
          return !itemValue || String(itemValue).trim() === '';
        
        case 'isNotEmpty':
          return itemValue && String(itemValue).trim() !== '';
        
        default:
          console.warn(`Unsupported condition operator: ${operator}`);
          return true;
      }
    });
  });
};

/**
 * Apply filters to data
 * @param {Array} data - Source data
 * @param {Object} filters - Filter object
 * @returns {Array} Filtered data
 */
const applyFilters = (data, filters) => {
  return data.filter(item => {
    return Object.entries(filters).every(([field, filterValue]) => {
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return true;
      }
      
      const itemValue = getNestedValue(item, field);
      
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }
      
      if (typeof filterValue === 'string') {
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      }
      
      return itemValue === filterValue;
    });
  });
};

/**
 * Group data by time period
 * @param {Array} data - Source data
 * @param {string} dateField - Date field name
 * @param {string} period - Period type (day, week, month, year)
 * @returns {Object} Grouped data
 */
const groupByPeriod = (data, dateField, period) => {
  return data.reduce((acc, item) => {
    const dateValue = getNestedValue(item, dateField);
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) return acc;
    
    let periodKey;
    switch (period) {
      case 'day':
        periodKey = date.toISOString().split('T')[0];
        break;
      case 'week':
        const week = getWeekNumber(date);
        periodKey = `${date.getFullYear()}-W${week}`;
        break;
      case 'month':
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        periodKey = String(date.getFullYear());
        break;
      default:
        periodKey = date.toISOString().split('T')[0];
    }
    
    if (!acc[periodKey]) {
      acc[periodKey] = [];
    }
    acc[periodKey].push(item);
    
    return acc;
  }, {});
};

/**
 * Get week number for date
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Generate empty summary for cases with no data
 * @param {Array} cardConfigs - Card configurations
 * @returns {Object} Empty summary object
 */
const generateEmptySummary = (cardConfigs) => {
  const summary = {};
  
  if (cardConfigs && Array.isArray(cardConfigs)) {
    cardConfigs.forEach(config => {
      summary[config.key] = config.defaultValue || 0;
    });
  }
  
  return summary;
};

/**
 * Build formatted summary cards for display
 * @param {Object} summaryData - Raw summary data
 * @param {Array} cardConfigs - Card configurations
 * @param {Object} options - Display options
 * @returns {Array} Formatted cards ready for display
 */
export const buildFormattedSummaryCards = (summaryData, cardConfigs, options = {}) => {
  if (!summaryData || !cardConfigs) return [];
  
  return cardConfigs.map(config => {
    const rawValue = summaryData[config.key];
    const formattedValue = formatValue(rawValue, config.format, config.formatOptions);
    
    return {
      key: config.key,
      label: config.label,
      value: rawValue,
      formattedValue,
      format: config.format,
      color: config.color,
      icon: config.icon || getDefaultIcon(config.format),
      trend: calculateTrend(summaryData, config),
      metadata: summaryData[`${config.key}_meta`] || {}
    };
  });
};

/**
 * Get default icon for format type
 */
const getDefaultIcon = (format) => {
  switch (format) {
    case 'currency':
      return 'pi pi-dollar';
    case 'number':
      return 'pi pi-hashtag';
    case 'percentage':
      return 'pi pi-percentage';
    case 'date':
      return 'pi pi-calendar';
    default:
      return 'pi pi-info-circle';
  }
};

/**
 * Calculate trend information if available
 */
const calculateTrend = (summaryData, config) => {
  // This would require historical data or previous values
  // For now, return null - can be implemented based on specific requirements
  return null;
};

/**
 * Create common summary card configurations
 * @param {Array} data - Sample data for auto-detection
 * @returns {Object} Object with common card configurations
 */
export const createCommonSummaryCards = (data) => {
  if (!data || data.length === 0) return {};
  
  const sampleItem = data[0];
  const cards = {};
  
  // Auto-detect numeric fields for sum cards
  Object.keys(sampleItem).forEach(field => {
    const value = sampleItem[field];
    
    if (typeof value === 'number') {
      const fieldLower = field.toLowerCase();
      
      if (fieldLower.includes('amount') || fieldLower.includes('total') || 
          fieldLower.includes('price') || fieldLower.includes('cost')) {
        cards[`total${field}`] = {
          key: `total${field}`,
          label: `Total ${formatFieldName(field)}`,
          format: 'currency',
          color: 'primary',
          aggregate: { field, operation: 'sum' }
        };
      } else {
        cards[`total${field}`] = {
          key: `total${field}`,
          label: `Total ${formatFieldName(field)}`,
          format: 'number',
          color: 'info',
          aggregate: { field, operation: 'sum' }
        };
      }
    }
  });
  
  // Common count cards
  cards.totalRecords = {
    key: 'totalRecords',
    label: 'Total Records',
    format: 'number',
    color: 'primary',
    aggregate: { operation: 'count' }
  };
  
  return cards;
};

/**
 * Format field name for display
 */
const formatFieldName = (field) => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
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

/**
 * Apply aggregation operation on data
 * @param {Array} data - Source data array
 * @param {Object} config - Aggregation configuration
 * @returns {any} Aggregated result
 */
export const applyAggregation = (data, config) => {
  const { operation, field, conditions } = config;
  
  // Filter data based on conditions if provided
  let filteredData = data;
  if (conditions && Array.isArray(conditions)) {
    filteredData = data.filter(item => {
      return conditions.every(condition => {
        const value = getNestedValue(item, condition.field);
        return evaluateCondition(value, condition.operator, condition.value);
      });
    });
  }
  
  // Apply aggregation based on operation
  switch (operation) {
    case 'sum':
      return filteredData.reduce((sum, item) => {
        const value = parseFloat(getNestedValue(item, field)) || 0;
        return sum + value;
      }, 0);
    
    case 'count':
      return filteredData.length;
    
    case 'countUnique':
      const uniqueValues = new Set();
      filteredData.forEach(item => {
        const value = getNestedValue(item, field);
        if (value !== null && value !== undefined) {
          uniqueValues.add(value);
        }
      });
      return uniqueValues.size;
    
    case 'average':
      const values = filteredData
        .map(item => parseFloat(getNestedValue(item, field)))
        .filter(value => !isNaN(value));
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    
    case 'min':
      const minValues = filteredData
        .map(item => parseFloat(getNestedValue(item, field)))
        .filter(value => !isNaN(value));
      return minValues.length > 0 ? Math.min(...minValues) : 0;
    
    case 'max':
      const maxValues = filteredData
        .map(item => parseFloat(getNestedValue(item, field)))
        .filter(value => !isNaN(value));
      return maxValues.length > 0 ? Math.max(...maxValues) : 0;
    
    default:
      console.warn(`Unsupported aggregation operation: ${operation}`);
      return 0;
  }
};

/**
 * Evaluate condition for filtering
 * @param {any} value - Item value
 * @param {string} operator - Condition operator
 * @param {any} conditionValue - Value to compare against
 * @returns {boolean} Condition result
 */
const evaluateCondition = (value, operator, conditionValue) => {
  switch (operator) {
    case 'equals':
    case '==':
      return value == conditionValue;
    
    case 'notEquals':
    case '!=':
      return value != conditionValue;
    
    case 'greaterThan':
    case '>':
      return parseFloat(value) > parseFloat(conditionValue);
    
    case 'lessThan':
    case '<':
      return parseFloat(value) < parseFloat(conditionValue);
    
    case 'greaterThanOrEqual':
    case '>=':
      return parseFloat(value) >= parseFloat(conditionValue);
    
    case 'lessThanOrEqual':
    case '<=':
      return parseFloat(value) <= parseFloat(conditionValue);
    
    case 'contains':
      return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
    
    case 'in':
      return Array.isArray(conditionValue) && conditionValue.includes(value);
    
    case 'isNull':
      return value === null || value === undefined;
    
    case 'isNotNull':
      return value !== null && value !== undefined;
    
    default:
      return true;
  }
}
// Export utility functions for external use
export {
  applyConditions,
  applyFilters,
  groupByPeriod,
  calculateSum,
  calculateCount,
  calculateAverage
};