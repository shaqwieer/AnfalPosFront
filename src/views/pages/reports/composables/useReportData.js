// composables/useReportData.js
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useMainStore } from '@/stores/mainStore';
import { buildTableConfig, autoGenerateColumns } from '../utils/tableBuilder';

export function useReportData() {
  const { t } = useI18n();
  const mainStore = useMainStore();
  
  // State
  const loading = ref(false);
  const reportData = ref(null);
  const tableConfig = ref(null);
  const chartData = ref(null);
  const error = ref(null);
  
  // Computed
  const hasData = computed(() => {
    return reportData.value && reportData.value.length > 0;
  });

  const tableColumns = computed(() => {
    return tableConfig.value?.columns || [];
  });

  const tableRows = computed(() => {
    return tableConfig.value?.data || [];
  });

  const summary = computed(() => {
    return tableConfig.value?.summary || {};
  });

  // Methods
  const fetchReportData = async (report, filters = {}) => {
    if (!report?.endpoints?.data) {
      console.warn('No data endpoint defined for report:', report.id);
      return;
    }

    loading.value = true;
    error.value = null;
    
    try {
      const payload = prepareDataPayload(filters);
      const response = await apiClient.post(report.endpoints.data, payload);
      
      if (response.data.success) {
        reportData.value = response.data.data;
        
        // Build table configuration
        const columns = getReportColumns(report);
        const options = getTableOptions(report);
        
        tableConfig.value = buildTableConfig(
          response.data.data,
          columns,
          options
        );
        
        // Prepare chart data if needed
        if (report.chartConfig) {
          chartData.value = transformDataForCharts(response.data.data, report.chartConfig);
        }
        
        // mainStore.loading.setNotificationInfo('success', t('reports.dataLoadedSuccess'));
      } else {
        throw new Error(response.data.message || 'Failed to load report data');
      }
    } catch (err) {
      error.value = err.message;
      handleError(err, mainStore.loading);
      reportData.value = null;
      tableConfig.value = null;
    } finally {
      loading.value = false;
    }
  };

  const refreshData = async (report, filters = {}) => {
    await fetchReportData(report, filters);
  };

  const clearData = () => {
    reportData.value = null;
    tableConfig.value = null;
    chartData.value = null;
    error.value = null;
  };

  const prepareDataPayload = (filters) => {
    const payload = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof Date) {
          payload[key] = value.toISOString();
        } else {
          payload[key] = value;
        }
      }
    });
    
    return payload;
  };

  const getReportColumns = (report) => {
    // Use predefined columns if available
    if (report.columns && report.columns.length > 0) {
      return report.columns;
    }

    // Return null to trigger auto-generation
    return null;
  };

  const getTableOptions = (report) => {
    const defaultOptions = {
      enablePagination: true,
      defaultPageSize: 25,
      enableSorting: true,
      enableFiltering: true,
      enableExport: true,
      enableSelection: false,
      enableGrouping: false
    };

    // Merge with report-specific options
    return {
      ...defaultOptions,
      ...report.tableOptions
    };
  };

  const transformDataForCharts = (data, chartConfig) => {
    // Transform data for different chart types
    if (!data || data.length === 0) return null;

    const transformations = {
      bar: transformForBarChart,
      line: transformForLineChart,
      pie: transformForPieChart,
      area: transformForAreaChart
    };

    const transformer = transformations[chartConfig.type];
    return transformer ? transformer(data, chartConfig) : null;
  };

  const transformForBarChart = (data, config) => {
    const { labelField, valueField } = config;
    
    return {
      labels: data.map(item => item[labelField]),
      datasets: [{
        label: config.label || valueField,
        data: data.map(item => item[valueField]),
        backgroundColor: config.backgroundColor || '#3498db',
        borderColor: config.borderColor || '#2980b9',
        borderWidth: 1
      }]
    };
  };

  const transformForLineChart = (data, config) => {
    const { labelField, valueField } = config;
    
    return {
      labels: data.map(item => item[labelField]),
      datasets: [{
        label: config.label || valueField,
        data: data.map(item => item[valueField]),
        fill: false,
        borderColor: config.borderColor || '#3498db',
        backgroundColor: config.backgroundColor || '#3498db',
        tension: 0.1
      }]
    };
  };

  const transformForPieChart = (data, config) => {
    const { labelField, valueField } = config;
    
    return {
      labels: data.map(item => item[labelField]),
      datasets: [{
        data: data.map(item => item[valueField]),
        backgroundColor: config.colors || [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
      }]
    };
  };

  const transformForAreaChart = (data, config) => {
    const { labelField, valueField } = config;
    
    return {
      labels: data.map(item => item[labelField]),
      datasets: [{
        label: config.label || valueField,
        data: data.map(item => item[valueField]),
        fill: true,
        borderColor: config.borderColor || '#3498db',
        backgroundColor: config.backgroundColor || 'rgba(52, 152, 219, 0.2)',
        tension: 0.4
      }]
    };
  };

  const exportData = async (format, filename) => {
    if (!hasData.value) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const exportFilename = filename || `report-data-${timestamp}.${format}`;

    if (format === 'csv') {
      exportTableAsCSV(tableRows.value, tableColumns.value, exportFilename);
    } else if (format === 'json') {
      exportAsJSON(reportData.value, exportFilename);
    }
  };

  const exportAsJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportTableAsCSV = (data, columns, filename) => {
    if (!data || data.length === 0) return;

    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = getNestedValue(row, col.field);
        const formatted = col.formatter ? col.formatter(value) : value;
        return `"${String(formatted || '').replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return null;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  return {
    // State
    loading,
    reportData,
    tableConfig,
    chartData,
    error,
    
    // Computed
    hasData,
    tableColumns,
    tableRows,
    summary,
    
    // Methods
    fetchReportData,
    refreshData,
    clearData,
    exportData
  };
}