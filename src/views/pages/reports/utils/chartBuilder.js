/**
 * Dynamic Chart Builder Utility
 * Builds charts from any data structure based on configuration
 */

import { formatValue } from './formatters';

/**
 * Build chart data from any dataset
 * @param {Array} data - Array of data objects
 * @param {Object} chartConfig - Chart configuration
 * @returns {Object} Chart.js compatible data structure
 */
export const buildChartData = (data, chartConfig) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { labels: [], datasets: [] };
  }

  const {
    type,
    groupBy,
    aggregate,
    groupByFormat = null,
    limit = null,
    sortBy = 'desc', // 'asc', 'desc'
    title = 'Chart',
    colors = defaultColors,
    options = {}
  } = chartConfig;

  try {
    switch (type) {
      case 'bar':
      case 'line':
        return buildBarLineChart(data, chartConfig);
      
      case 'doughnut':
      case 'pie':
        return buildDoughnutPieChart(data, chartConfig);
      
      case 'radar':
        return buildRadarChart(data, chartConfig);
      
      case 'polarArea':
        return buildPolarAreaChart(data, chartConfig);
      
      default:
        console.warn(`Unsupported chart type: ${type}`);
        return buildBarLineChart(data, chartConfig);
    }
  } catch (error) {
    console.error('Error building chart data:', error);
    return { labels: [], datasets: [] };
  }
};

/**
 * Build bar/line chart data
 */
const buildBarLineChart = (data, config) => {
  const aggregatedData = aggregateData(data, config);
  const sortedData = sortAggregatedData(aggregatedData, config.sortBy);
  const limitedData = config.limit ? sortedData.slice(0, config.limit) : sortedData;

  const labels = limitedData.map(item => formatGroupByValue(item.group, config.groupByFormat));
  const values = limitedData.map(item => item.value);

  return {
    labels,
    datasets: [{
      label: config.title,
      data: values,
      backgroundColor: config.type === 'bar' 
        ? config.colors?.[0] || defaultColors[0]
        : `${config.colors?.[0] || defaultColors[0]}33`, // 20% opacity for line fill
      borderColor: config.colors?.[0] || defaultColors[0],
      borderWidth: 2,
      fill: config.type === 'line',
      tension: config.type === 'line' ? (config.options?.tension || 0.4) : 0,
      ...config.options?.dataset || {}
    }]
  };
};

/**
 * Build doughnut/pie chart data
 */
const buildDoughnutPieChart = (data, config) => {
  const aggregatedData = aggregateData(data, config);
  const sortedData = sortAggregatedData(aggregatedData, config.sortBy);
  const limitedData = config.limit ? sortedData.slice(0, config.limit) : sortedData;

  const labels = limitedData.map(item => formatGroupByValue(item.group, config.groupByFormat));
  const values = limitedData.map(item => item.value);
  const backgroundColors = generateColors(labels.length, config.colors);

  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: backgroundColors,
      borderColor: backgroundColors.map(color => color.replace(/[\d\.]+\)$/g, '1)')), // Full opacity for borders
      borderWidth: 2,
      ...config.options?.dataset || {}
    }]
  };
};

/**
 * Build radar chart data
 */
const buildRadarChart = (data, config) => {
  const aggregatedData = aggregateData(data, config);
  const sortedData = sortAggregatedData(aggregatedData, config.sortBy);
  const limitedData = config.limit ? sortedData.slice(0, config.limit) : sortedData;

  const labels = limitedData.map(item => formatGroupByValue(item.group, config.groupByFormat));
  const values = limitedData.map(item => item.value);

  return {
    labels,
    datasets: [{
      label: config.title,
      data: values,
      backgroundColor: `${config.colors?.[0] || defaultColors[0]}33`, // 20% opacity
      borderColor: config.colors?.[0] || defaultColors[0],
      borderWidth: 2,
      pointBackgroundColor: config.colors?.[0] || defaultColors[0],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: config.colors?.[0] || defaultColors[0],
      ...config.options?.dataset || {}
    }]
  };
};

/**
 * Build polar area chart data
 */
const buildPolarAreaChart = (data, config) => {
  // Similar to doughnut but with different styling
  return buildDoughnutPieChart(data, config);
};

/**
 * Aggregate data based on groupBy field and aggregate operation
 * @param {Array} data - Source data array
 * @param {Object} config - Configuration with groupBy and aggregate settings
 * @returns {Array} Aggregated data in format [{ group, value }]
 */
export const aggregateData = (data, config) => {
  const { groupBy, aggregate, groupByFormat } = config;
  
  if (!groupBy || !aggregate) {
    console.warn('groupBy and aggregate are required for data aggregation');
    return [];
  }

  // Group data by the specified field
  const grouped = data.reduce((acc, item) => {
    let groupValue = getNestedValue(item, groupBy);
    
    // Format group value if needed (e.g., for dates)
    if (groupByFormat === 'date' && groupValue) {
      groupValue = formatDateForGrouping(groupValue, groupByFormat);
    }
    
    if (groupValue === null || groupValue === undefined) {
      groupValue = 'Unknown';
    }

    if (!acc[groupValue]) {
      acc[groupValue] = [];
    }
    acc[groupValue].push(item);
    return acc;
  }, {});

  // Apply aggregation operation
  const aggregated = Object.entries(grouped).map(([group, items]) => ({
    group,
    value: applyAggregation(items, aggregate),
    count: items.length
  }));

  return aggregated;
};

/**
 * Apply aggregation operation to a group of items
 * @param {Array} items - Items in the group
 * @param {Object} aggregate - Aggregation configuration { field, operation }
 * @returns {number} Aggregated value
 */
export const applyAggregation = (items, aggregate) => {
  const { field, operation } = aggregate;

  switch (operation) {
    case 'sum':
      return items.reduce((sum, item) => {
        const value = parseFloat(getNestedValue(item, field)) || 0;
        return sum + value;
      }, 0);

    case 'count':
      return items.length;

    case 'countUnique':
      const uniqueValues = new Set(items.map(item => getNestedValue(item, field)));
      return uniqueValues.size;

    case 'countTrue':
      return items.filter(item => Boolean(getNestedValue(item, field))).length;

    case 'countFalse':
      return items.filter(item => !Boolean(getNestedValue(item, field))).length;

    case 'average':
    case 'avg':
      const sum = items.reduce((sum, item) => {
        const value = parseFloat(getNestedValue(item, field)) || 0;
        return sum + value;
      }, 0);
      return items.length > 0 ? sum / items.length : 0;

    case 'min':
      const minValues = items.map(item => parseFloat(getNestedValue(item, field)) || 0);
      return Math.min(...minValues);

    case 'max':
      const maxValues = items.map(item => parseFloat(getNestedValue(item, field)) || 0);
      return Math.max(...maxValues);

    case 'median':
      const sortedValues = items
        .map(item => parseFloat(getNestedValue(item, field)) || 0)
        .sort((a, b) => a - b);
      const mid = Math.floor(sortedValues.length / 2);
      return sortedValues.length % 2 !== 0 
        ? sortedValues[mid] 
        : (sortedValues[mid - 1] + sortedValues[mid]) / 2;

    default:
      console.warn(`Unsupported aggregation operation: ${operation}`);
      return 0;
  }
};

/**
 * Get nested object value using dot notation
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path (e.g., 'customer.name')
 * @returns {any} Value at path
 */
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

/**
 * Sort aggregated data
 * @param {Array} data - Aggregated data
 * @param {string} sortBy - 'asc' or 'desc'
 * @returns {Array} Sorted data
 */
const sortAggregatedData = (data, sortBy) => {
  return [...data].sort((a, b) => {
    if (sortBy === 'asc') {
      return a.value - b.value;
    } else {
      return b.value - a.value;
    }
  });
};

/**
 * Format group by value for display
 * @param {any} value - Raw group value
 * @param {string} format - Format type
 * @returns {string} Formatted value
 */
const formatGroupByValue = (value, format) => {
  if (format === 'date' && value) {
    return formatValue(value, 'date');
  }
  
  if (value === null || value === undefined) {
    return 'Unknown';
  }
  
  return String(value);
};

/**
 * Format date for grouping (e.g., by day, month, year)
 * @param {Date|string} date - Date value
 * @param {string} format - Grouping format
 * @returns {string} Formatted date for grouping
 */
const formatDateForGrouping = (date, format) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  // Group by day by default
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Generate colors for chart
 * @param {number} count - Number of colors needed
 * @param {Array} customColors - Custom color palette
 * @returns {Array} Array of colors
 */
const generateColors = (count, customColors = null) => {
  const colors = customColors || defaultColors;
  const result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
};

/**
 * Build multiple chart configurations
 * @param {Array} data - Source data
 * @param {Array} chartConfigs - Array of chart configurations
 * @returns {Array} Array of chart data objects
 */
export const buildMultipleCharts = (data, chartConfigs) => {
  return chartConfigs.map(config => ({
    id: config.id,
    title: config.title,
    type: config.type,
    data: buildChartData(data, config),
    options: getChartOptions(config)
  }));
};

/**
 * Get Chart.js options for a chart configuration
 * @param {Object} config - Chart configuration
 * @returns {Object} Chart.js options
 */
export const getChartOptions = (config) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: config.title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label}: ${formatValue(value, 'number')}`;
          }
        }
      }
    }
  };

  // Add scales for bar/line charts
  if (config.type === 'bar' || config.type === 'line') {
    baseOptions.scales = {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return formatAxisValue(value);
          }
        }
      }
    };
  }

  // Merge with custom options
  return mergeDeep(baseOptions, config.options || {});
};

/**
 * Format axis values (e.g., 1000 -> 1K)
 * @param {number} value - Axis value
 * @returns {string} Formatted value
 */
const formatAxisValue = (value) => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
  }
  return value;
};

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
const mergeDeep = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

// Default color palette
const defaultColors = [
  'rgba(54, 162, 235, 0.8)',   // Blue
  'rgba(255, 99, 132, 0.8)',   // Red
  'rgba(255, 205, 86, 0.8)',   // Yellow
  'rgba(75, 192, 192, 0.8)',   // Teal
  'rgba(153, 102, 255, 0.8)',  // Purple
  'rgba(255, 159, 64, 0.8)',   // Orange
  'rgba(199, 199, 199, 0.8)',  // Grey
  'rgba(83, 102, 255, 0.8)',   // Indigo
  'rgba(255, 99, 255, 0.8)',   // Magenta
  'rgba(99, 255, 132, 0.8)',   // Green
];

export { defaultColors };