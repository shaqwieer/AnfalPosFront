/**
 * Dynamic Table Builder Utility
 * Builds DataTable configurations from any data structure
 */

import { formatValue,getNestedValue } from './formatters';

/**
 * Build table configuration from data and column definitions
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {Object} options - Additional table options
 * @returns {Object} Table configuration
 */
export const buildTableConfig = (data, columns, options = {}) => {
  if (!data || !Array.isArray(data)) {
    return {
      data: [],
      columns: [],
      meta: { totalRows: 0, hasData: false }
    };
  }

  const {
    enablePagination = true,
    defaultPageSize = 25,
    enableSorting = true,
    enableFiltering = true,
    enableExport = true,
    enableSelection = false,
    enableGrouping = false,
    groupBy = null
  } = options;

  // Auto-generate columns if not provided
  const tableColumns = columns && columns.length > 0 
    ? buildColumnsFromConfig(columns, data)
    : autoGenerateColumns(data);

  // Process data (grouping, sorting, etc.)
  const processedData = processTableData(data, options);

  return {
    data: processedData,
    columns: tableColumns,
    options: {
      enablePagination,
      defaultPageSize,
      enableSorting,
      enableFiltering,
      enableExport,
      enableSelection,
      enableGrouping,
      groupBy
    },
    meta: {
      totalRows: data.length,
      hasData: data.length > 0,
      processedRows: processedData.length
    }
  };
};

/**
 * Build columns from configuration
 * @param {Array} columnConfigs - Column configuration array
 * @param {Array} data - Data array for auto-detection
 * @returns {Array} Processed column definitions
 */
const buildColumnsFromConfig = (columnConfigs, data) => {
  return columnConfigs.map(config => {
    const column = {
      field: config.field,
      header: config.header || formatHeader(config.field),
      sortable: config.sortable !== false,
      filterable: config.filterable !== false,
      width: config.width || 'auto',
      type: config.type || detectColumnType(data, config.field),
      align: getColumnAlignment(config.type),
      formatter: getColumnFormatter(config.type, config.format),
      ...config // Allow custom properties to override
    };

    // Add filter configuration if enabled
    if (column.filterable) {
      column.filterConfig = buildFilterConfig(column.type, config.filterOptions);
    }

    return column;
  });
};

/**
 * Auto-generate columns from data structure
 * @param {Array} data - Data array
 * @returns {Array} Auto-generated column definitions
 */
export const autoGenerateColumns = (data) => {
  if (!data || data.length === 0) return [];

  const sampleItem = data[0];
  const columns = [];

  Object.keys(sampleItem).forEach(field => {
    const type = detectColumnType(data, field);
    
    columns.push({
      field,
      header: formatHeader(field),
      sortable: true,
      filterable: true,
      width: getDefaultWidth(type),
      type,
      align: getColumnAlignment(type),
      formatter: getColumnFormatter(type)
    });
  });

  return columns;
};

/**
 * Detect column type from data
 * @param {Array} data - Data array
 * @param {string} field - Field name
 * @returns {string} Detected type
 */
export const detectColumnType = (data, field) => {
  if (!data || data.length === 0) return 'text';

  // Sample multiple items to get better type detection
  const sampleSize = Math.min(10, data.length);
  const samples = data.slice(0, sampleSize);

  const types = samples.map(item => {
    const value = getNestedValue(item, field);
    return detectValueType(value);
  });

  // Return the most common type
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
    typeCounts[a] > typeCounts[b] ? a : b
  );

  return mostCommonType;
};

/**
 * Detect value type
 * @param {any} value - Value to analyze
 * @returns {string} Value type
 */
const detectValueType = (value) => {
  if (value === null || value === undefined) return 'text';

  // Boolean check
  if (typeof value === 'boolean') return 'boolean';

  // Date check
  if (value instanceof Date || (typeof value === 'string' && isDateString(value))) {
    return 'date';
  }

  // Number check
  if (typeof value === 'number' || (typeof value === 'string' && isNumericString(value))) {
    // Check if it looks like currency (has decimal places or currency indicators)
    if (typeof value === 'string' && /[\$\€\£\¥]/.test(value)) {
      return 'currency';
    }
    
    if (typeof value === 'number' || (typeof value === 'string' && value.includes('.'))) {
      // Could be currency based on field name
      const lowerField = String(value).toLowerCase();
      if (lowerField.includes('amount') || lowerField.includes('price') || 
          lowerField.includes('cost') || lowerField.includes('total')) {
        return 'currency';
      }
      return 'number';
    }
    
    return 'number';
  }

  // Email check
  if (typeof value === 'string' && isEmailString(value)) {
    return 'email';
  }

  // URL check
  if (typeof value === 'string' && isUrlString(value)) {
    return 'url';
  }

  // Status check (common status values)
  if (typeof value === 'string' && isStatusString(value)) {
    return 'status';
  }

  return 'text';
};

/**
 * Check if string is a date
 */
const isDateString = (str) => {
  if (typeof str !== 'string') return false;
  const date = new Date(str);
  return !isNaN(date.getTime()) && str.length > 5;
};

/**
 * Check if string is numeric
 */
const isNumericString = (str) => {
  if (typeof str !== 'string') return false;
  return !isNaN(parseFloat(str)) && isFinite(str);
};

/**
 * Check if string is email
 */
const isEmailString = (str) => {
  if (typeof str !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
};

/**
 * Check if string is URL
 */
const isUrlString = (str) => {
  if (typeof str !== 'string') return false;
  return /^https?:\/\/.+/.test(str);
};

/**
 * Check if string is status value
 */
const isStatusString = (str) => {
  if (typeof str !== 'string') return false;
  const statusValues = ['active', 'inactive', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'draft'];
  return statusValues.includes(str.toLowerCase());
};

/**
 * Format header from field name
 * @param {string} field - Field name
 * @returns {string} Formatted header
 */
const formatHeader = (field) => {
  return field
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, str => str.toUpperCase()); // Capitalize each word
};

/**
 * Get column alignment based on type
 * @param {string} type - Column type
 * @returns {string} Alignment
 */
const getColumnAlignment = (type) => {
  switch (type) {
    case 'number':
    case 'currency':
      return 'right';
    case 'date':
      return 'center';
    case 'boolean':
      return 'center';
    default:
      return 'left';
  }
};

/**
 * Get default width for column type
 * @param {string} type - Column type
 * @returns {string} Default width
 */
const getDefaultWidth = (type) => {
  switch (type) {
    case 'boolean':
      return '80px';
    case 'date':
      return '120px';
    case 'currency':
    case 'number':
      return '110px';
    case 'email':
      return '200px';
    case 'url':
      return '150px';
    case 'status':
      return '100px';
    default:
      return '150px';
  }
};

/**
 * Get column formatter function
 * @param {string} type - Column type
 * @param {Object} formatOptions - Format options
 * @returns {Function} Formatter function
 */
const getColumnFormatter = (type, formatOptions = {}) => {
  return (value) => {
    switch (type) {
      case 'currency':
        return formatValue(value, 'currency', formatOptions);
      case 'number':
        return formatValue(value, 'number', formatOptions);
      case 'date':
        return formatValue(value, 'date', formatOptions);
      case 'boolean':
        return formatValue(value, 'boolean', formatOptions);
      case 'status':
        return formatValue(value, 'status', formatOptions);
      case 'email':
      case 'url':
      case 'text':
      default:
        return formatValue(value, 'text', formatOptions);
    }
  };
};

/**
 * Build filter configuration for column
 * @param {string} type - Column type
 * @param {Object} options - Filter options
 * @returns {Object} Filter configuration
 */
const buildFilterConfig = (type, options = {}) => {
  const baseConfig = {
    enabled: true,
    placeholder: `Filter...`,
    ...options
  };

  switch (type) {
    case 'date':
      return {
        ...baseConfig,
        type: 'date',
        component: 'Calendar'
      };
    
    case 'number':
    case 'currency':
      return {
        ...baseConfig,
        type: 'number',
        component: 'InputNumber'
      };
    
    case 'boolean':
      return {
        ...baseConfig,
        type: 'select',
        component: 'Dropdown',
        options: [
          { label: 'All', value: null },
          { label: 'Yes', value: true },
          { label: 'No', value: false }
        ]
      };
    
    case 'status':
      return {
        ...baseConfig,
        type: 'select',
        component: 'Dropdown'
      };
    
    default:
      return {
        ...baseConfig,
        type: 'text',
        component: 'InputText'
      };
  }
};

/**
 * Process table data (sorting, grouping, etc.)
 * @param {Array} data - Source data
 * @param {Object} options - Processing options
 * @returns {Array} Processed data
 */
const processTableData = (data, options = {}) => {
  let processedData = [...data];

  // Apply grouping if specified
  if (options.enableGrouping && options.groupBy) {
    processedData = applyGrouping(processedData, options.groupBy);
  }

  // Apply default sorting if specified
  if (options.defaultSort) {
    processedData = applySorting(processedData, options.defaultSort);
  }

  // Apply filtering if specified
  if (options.defaultFilters) {
    processedData = applyFiltering(processedData, options.defaultFilters);
  }

  return processedData;
};

/**
 * Apply grouping to data
 * @param {Array} data - Source data
 * @param {string} groupBy - Field to group by
 * @returns {Array} Grouped data
 */
const applyGrouping = (data, groupBy) => {
  const grouped = data.reduce((acc, item) => {
    const groupValue = getNestedValue(item, groupBy) || 'Unknown';
    
    if (!acc[groupValue]) {
      acc[groupValue] = [];
    }
    acc[groupValue].push(item);
    return acc;
  }, {});

  // Flatten grouped data with group headers
  const result = [];
  Object.entries(grouped).forEach(([group, items]) => {
    // Add group header
    result.push({
      _isGroupHeader: true,
      _groupName: group,
      _groupCount: items.length
    });
    
    // Add group items
    result.push(...items.map(item => ({ ...item, _groupParent: group })));
  });

  return result;
};

/**
 * Apply sorting to data
 * @param {Array} data - Source data
 * @param {Object} sortConfig - Sort configuration
 * @returns {Array} Sorted data
 */
const applySorting = (data, sortConfig) => {
  const { field, direction = 'asc' } = sortConfig;
  
  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue > bValue ? 1 : -1;
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Apply filtering to data
 * @param {Array} data - Source data
 * @param {Object} filters - Filter configuration
 * @returns {Array} Filtered data
 */
const applyFiltering = (data, filters) => {
  return data.filter(item => {
    return Object.entries(filters).every(([field, filterValue]) => {
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return true;
      }
      
      const itemValue = getNestedValue(item, field);
      
      if (typeof filterValue === 'string') {
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      }
      
      return itemValue === filterValue;
    });
  });
};

/**
 * Generate table summary statistics
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @returns {Object} Summary statistics
 */
export const generateTableSummary = (data, columns) => {
  if (!data || data.length === 0) return {};

  const summary = {
    totalRows: data.length,
    columns: columns.map(column => {
      const values = data
        .map(item => getNestedValue(item, column.field))
        .filter(value => value !== null && value !== undefined);

      const stats = {
        field: column.field,
        header: column.header,
        type: column.type,
        totalValues: values.length,
        nullValues: data.length - values.length
      };

      if (column.type === 'number' || column.type === 'currency') {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          stats.sum = numericValues.reduce((sum, val) => sum + val, 0);
          stats.average = stats.sum / numericValues.length;
          stats.min = Math.min(...numericValues);
          stats.max = Math.max(...numericValues);
        }
      }

      if (column.type === 'text' || column.type === 'status') {
        const uniqueValues = [...new Set(values)];
        stats.uniqueValues = uniqueValues.length;
        stats.mostCommon = findMostCommonValue(values);
      }

      if (column.type === 'boolean') {
        stats.trueCount = values.filter(v => Boolean(v)).length;
        stats.falseCount = values.filter(v => !Boolean(v)).length;
      }

      return stats;
    })
  };

  return summary;
};

/**
 * Find most common value in array
 * @param {Array} values - Array of values
 * @returns {any} Most common value
 */
const findMostCommonValue = (values) => {
  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

/**
 * Export table data as CSV
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @param {string} filename - Export filename
 * @returns {void}
 */
export const exportTableAsCSV = (data, columns, filename = 'export.csv') => {
  if (!data || data.length === 0) return;

  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = getNestedValue(row, col.field);
      const formatted = col.formatter ? col.formatter(value) : value;
      // Escape CSV special characters
      return `"${String(formatted).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};