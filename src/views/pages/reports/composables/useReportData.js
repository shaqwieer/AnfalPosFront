import { ref, computed, watch } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useReportFilters } from './useReportFilters';
import { buildChartData, buildMultipleCharts } from '../utils/chartBuilder';
import { buildSummaryData, buildFormattedSummaryCards } from '../utils/summaryBuilder';
import { buildTableConfig } from '../utils/tableBuilder';
import { useDebounceFn } from '@vueuse/core';

export function useReportData(report) {
  const mainStore = useMainStore();

  // Get filter composable
  const { filterValues, isFormValid, prepareFilterPayload } = useReportFilters(report);

  // Reactive state
  const reportData = ref([]);
  const reportSummary = ref({});
  const chartData = ref({});
  const multipleCharts = ref([]);
  const formattedSummaryCards = ref([]);
  const tableConfig = ref({});
  const loading = ref(false);
  const error = ref(null);
  const lastFetchTime = ref(null);

  // Computed properties
  const hasData = computed(() => {
    return reportData.value && reportData.value.length > 0;
  });

  const hasSummary = computed(() => {
    return reportSummary.value && Object.keys(reportSummary.value).length > 0;
  });

  const hasChartData = computed(() => {
    return chartData.value && chartData.value.labels && chartData.value.labels.length > 0;
  });

  const hasMultipleCharts = computed(() => {
    return multipleCharts.value && multipleCharts.value.length > 0;
  });

  const dataStats = computed(() => {
    if (!hasData.value) return {};

    return {
      totalRows: reportData.value.length,
      lastUpdated: lastFetchTime.value,
      hasFilters: isFormValid.value
    };
  });

  // Methods
  const loadReportData = async (forceRefresh = false) => {
    if (!report.value || !report.value.dataEndpoint) {
      console.warn('No data endpoint configured for report:', report.value?.id);
      return;
    }

    if (!isFormValid.value) {
      console.warn('Form validation failed, skipping data load');
      return;
    }

    // Avoid duplicate requests unless forced
    if (loading.value && !forceRefresh) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const payload = prepareFilterPayload('data');

      const response = await apiClient({
        url: report.value.dataEndpoint,
        method: report.value.dataMethod || 'POST',
        data: payload,
        timeout: 30000 // 30 seconds timeout
      });
      debugger;

      if (response.data.success) {
        const responseData = response.data.data;

        // Handle different response structures
        if (responseData.items && Array.isArray(responseData.items)) {
          reportData.value = responseData.items;
          reportSummary.value = responseData.summary || {};
        } else if (Array.isArray(responseData)) {
          reportData.value = responseData;
          reportSummary.value = {};
        } else if (responseData.data && Array.isArray(responseData.data)) {
          reportData.value = responseData.data;
          reportSummary.value = responseData.summary || {};
        } else {
          reportData.value = [];
          reportSummary.value = responseData || {};
        }

        // Process data with dynamic builders
        await processReportData();

        lastFetchTime.value = new Date();

      } else {
        throw new Error(response.data.message || 'Failed to load report data');
      }
    } catch (err) {
      error.value = err.message || 'Failed to load report data';
      reportData.value = [];
      reportSummary.value = {};
      clearProcessedData();

      // Don't show error toast for user-initiated actions
      if (!forceRefresh) {
        handleError(err, mainStore.loading);
      }
    } finally {
      loading.value = false;
    }
  };

  /**
   * Process report data using dynamic builders
   */
  const processReportData = async () => {
    if (!hasData.value || !report.value) {
      clearProcessedData();
      return;
    }

    try {
      // Build summary data using dynamic summary builder
      if (report.value.summaryCards && report.value.summaryCards.length > 0) {
        const summaryData = buildSummaryData(reportData.value, report.value.summaryCards, {
          includeMetadata: true,
          filters: filterValues
        });

        reportSummary.value = { ...reportSummary.value, ...summaryData };

        // Build formatted summary cards for display
        formattedSummaryCards.value = buildFormattedSummaryCards(summaryData, report.value.summaryCards);
      }

      // Build chart data using dynamic chart builder
      if (report.value.chartConfig) {
        chartData.value = buildChartData(reportData.value, report.value.chartConfig);
      }

      // Build multiple charts if configured
      if (report.value.chartConfigs && report.value.chartConfigs.length > 0) {
        multipleCharts.value = buildMultipleCharts(reportData.value, report.value.chartConfigs);
      }

      // Build table configuration using dynamic table builder
      if (report.value.columns && report.value.columns.length > 0) {
        tableConfig.value = buildTableConfig(reportData.value, report.value.columns, {
          enablePagination: true,
          defaultPageSize: 25,
          enableSorting: true,
          enableFiltering: true,
          enableExport: true
        });
      }
    } catch (error) {
      console.error('Error processing report data:', error);
      clearProcessedData();
    }
  };

  /**
   * Clear all processed data
   */
  const clearProcessedData = () => {
    chartData.value = {};
    multipleCharts.value = [];
    formattedSummaryCards.value = [];
    tableConfig.value = {};
  };

  /**
   * Switch between multiple chart configurations
   */
  const switchChart = (chartId) => {
    if (!report.value?.chartConfigs) return;

    const chartConfig = report.value.chartConfigs.find((config) => config.id === chartId);
    if (chartConfig) {
      chartData.value = buildChartData(reportData.value, chartConfig);
    }
  };

  /**
   * Refresh data with current filters
   */
  const refreshData = () => {
    return loadReportData(true);
  };

  /**
   * Clear all data
   */
  const clearData = () => {
    reportData.value = [];
    reportSummary.value = {};
    clearProcessedData();
    error.value = null;
    lastFetchTime.value = null;
  };

  /**
   * Update summary with custom aggregations
   */
  const updateSummaryWithCustomAggregations = (customAggregators) => {
    if (!hasData.value || !report.value?.summaryCards) return;

    const summaryData = buildSummaryData(reportData.value, report.value.summaryCards, {
      includeMetadata: true,
      customAggregators,
      filters: filterValues
    });

    reportSummary.value = { ...reportSummary.value, ...summaryData };
    formattedSummaryCards.value = buildFormattedSummaryCards(summaryData, report.value.summaryCards);
  };

  /**
   * Get nested value from object using dot notation
   */
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return null;

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };



  // Watch for filter changes and auto-reload data
  watch(
    [filterValues, isFormValid],
    ([newFilterValues, newIsValid], [oldFilterValues, oldIsValid]) => {
      // Only reload if form is valid and filters have actually changed
      if (newIsValid && report.value?.dataEndpoint) {
        // Add debounce to avoid too many requests
        useDebounceFn(() => {
          loadReportData();
        }, 500);
      }
    },
    { deep: true }
  );

  // Watch for report changes
  watch(report, (newReport) => {
    if (newReport) {
      clearData();
    }
  });

  return {
    // State
    reportData,
    reportSummary,
    chartData,
    multipleCharts,
    formattedSummaryCards,
    tableConfig,
    loading,
    error,
    lastFetchTime,

    // Computed
    hasData,
    hasSummary,
    hasChartData,
    hasMultipleCharts,
    dataStats,

    // Methods
    loadReportData,
    refreshData,
    clearData,
    switchChart,
    updateSummaryWithCustomAggregations,
    processReportData
  };
}
