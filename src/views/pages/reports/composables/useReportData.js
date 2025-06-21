// composables/useReportData.js
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useMainStore } from '@/stores/mainStore';
import { buildTableConfig, autoGenerateColumns } from '../utils/tableBuilder';
import { buildSummaryData, buildFormattedSummaryCards } from '../utils/summaryBuilder';
import { buildChartData, buildMultipleCharts, getChartOptions } from '../utils/chartBuilder';

export function useReportData() {
  const { t } = useI18n();
  const mainStore = useMainStore();
  
  // State
  const loading = ref(false);
  const reportData = ref(null);
  const tableConfig = ref(null);
  const chartData = ref([]);
  const summaryData = ref(null);
  const formattedSummaryCards = ref([]);
  const error = ref(null);
  
  // Data Visualization Controls
  const enabledVisualizationTypes = ref(['summary', 'table', 'charts']);
  const availableVisualizationTypes = ref([]);

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

  const hasSummaryCards = computed(() => {
    return formattedSummaryCards.value && formattedSummaryCards.value.length > 0;
  });

  const hasCharts = computed(() => {
    return chartData.value && chartData.value.length > 0;
  });

  const shouldShowSummary = computed(() => {
    return enabledVisualizationTypes.value.includes('summary') && hasSummaryCards.value;
  });

  const shouldShowTable = computed(() => {
    return enabledVisualizationTypes.value.includes('table') && hasData.value;
  });

  const shouldShowCharts = computed(() => {
    return enabledVisualizationTypes.value.includes('charts') && hasCharts.value;
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
        
        // Determine available visualization types based on report configuration
        availableVisualizationTypes.value = getAvailableVisualizationTypes(report);
        
        // Build table configuration
        const columns = getReportColumns(report);
        const options = getTableOptions(report);
        
        tableConfig.value = buildTableConfig(
          response.data.data,
          columns,
          options
        );
        
        // Build summary cards if enabled
        if (report.summaryCards && report.summaryCards.length > 0) {
          await buildSummaryCards(report, response.data.data, filters);
        }
        
        // Build charts if enabled
        if (report.chartConfigs && report.chartConfigs.length > 0) {
          await buildCharts(report, response.data.data);
        }
        
      } else {
        throw new Error(response.data.message || 'Failed to load report data');
      }
    } catch (err) {
      error.value = err.message;
      handleError(err, mainStore.loading);
      reportData.value = null;
      tableConfig.value = null;
      summaryData.value = null;
      formattedSummaryCards.value = [];
      chartData.value = [];
    } finally {
      loading.value = false;
    }
  };

  const buildSummaryCards = async (report, data, filters = {}) => {
    try {
      const options = {
        includeMetadata: true,
        filters: Object.keys(filters).length > 0 ? filters : null,
        customAggregators: report.customAggregators || {}
      };

      summaryData.value = buildSummaryData(data, report.summaryCards, options);
      
      formattedSummaryCards.value = buildFormattedSummaryCards(
        summaryData.value, 
        report.summaryCards,
        {
          includeAnimation: true,
          includeTrends: report.enableTrends || false
        }
      );

      console.log('Summary cards built:', {
        rawData: summaryData.value,
        formattedCards: formattedSummaryCards.value
      });

    } catch (error) {
      console.error('Error building summary cards:', error);
      summaryData.value = {};
      formattedSummaryCards.value = [];
    }
  };

  const buildCharts = async (report, data) => {
    try {
      if (!report.chartConfigs || report.chartConfigs.length === 0) {
        chartData.value = [];
        return;
      }

      // Build all charts using the chart builder
      const charts = buildMultipleCharts(data, report.chartConfigs);
      
      // Format charts for display with additional metadata
      chartData.value = charts.map(chart => ({
        ...chart,
        options: getChartOptions(report.chartConfigs.find(config => config.id === chart.id)),
        loading: false,
        error: null
      }));

      console.log('Charts built:', chartData.value);

    } catch (error) {
      console.error('Error building charts:', error);
      chartData.value = [];
    }
  };

  const getAvailableVisualizationTypes = (report) => {
    const types = [];
    
    // Always include table if report has data endpoint
    if (report.endpoints?.data) {
      types.push('table');
    }
    
    // Include summary if report has summary cards
    if (report.summaryCards && report.summaryCards.length > 0) {
      types.push('summary');
    }
    
    // Include charts if report has chart configurations
    if (report.chartConfigs && report.chartConfigs.length > 0) {
      types.push('charts');
    }
    
    return types;
  };

  const updateVisualizationTypes = (newTypes) => {
    enabledVisualizationTypes.value = [...newTypes];
  };

  const refreshData = async (report, filters = {}) => {
    await fetchReportData(report, filters);
  };

  const clearData = () => {
    reportData.value = null;
    tableConfig.value = null;
    chartData.value = [];
    summaryData.value = null;
    formattedSummaryCards.value = [];
    error.value = null;
    availableVisualizationTypes.value = [];
    enabledVisualizationTypes.value = ['summary', 'table', 'charts'];
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

  // Chart-specific methods
  const refreshChart = async (chartId, report) => {
    if (!reportData.value || !report.chartConfigs) return;
    
    const chartConfig = report.chartConfigs.find(config => config.id === chartId);
    if (!chartConfig) return;

    try {
      const newChartData = buildChartData(reportData.value, chartConfig);
      const chartIndex = chartData.value.findIndex(chart => chart.id === chartId);
      
      if (chartIndex !== -1) {
        chartData.value[chartIndex] = {
          ...chartData.value[chartIndex],
          data: newChartData,
          loading: false,
          error: null
        };
      }
    } catch (error) {
      console.error(`Error refreshing chart ${chartId}:`, error);
      const chartIndex = chartData.value.findIndex(chart => chart.id === chartId);
      if (chartIndex !== -1) {
        chartData.value[chartIndex].error = error.message;
        chartData.value[chartIndex].loading = false;
      }
    }
  };

  const toggleChart = (chartId, enabled) => {
    const chartIndex = chartData.value.findIndex(chart => chart.id === chartId);
    if (chartIndex !== -1) {
      chartData.value[chartIndex].enabled = enabled;
    }
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
    summaryData,
    formattedSummaryCards,
    error,
    
    // Visualization Controls
    enabledVisualizationTypes,
    availableVisualizationTypes,
    
    // Computed
    hasData,
    hasSummaryCards,
    hasCharts,
    tableColumns,
    tableRows,
    summary,
    shouldShowSummary,
    shouldShowTable,
    shouldShowCharts,
    
    // Methods
    fetchReportData,
    refreshData,
    clearData,
    exportData,
    buildSummaryCards,
    buildCharts,
    updateVisualizationTypes,
    refreshChart,
    toggleChart
  };
}