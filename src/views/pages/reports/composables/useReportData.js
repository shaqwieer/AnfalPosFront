import { ref, computed, watch } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useReportFilters } from './useReportFilters';

export function useReportData(report) {
  const mainStore = useMainStore();
  
  // Get filter composable
  const { filterValues, isFormValid, prepareFilterPayload } = useReportFilters(report);
  
  // Reactive state
  const reportData = ref([]);
  const reportSummary = ref({});
  const chartData = ref({});
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

        // Generate chart data
        await prepareChartData();
        
        lastFetchTime.value = new Date();
        
        // Track successful data load
        trackDataLoad('success', reportData.value.length);
        
      } else {
        throw new Error(response.data.message || 'Failed to load report data');
      }
    } catch (err) {
      error.value = err.message || 'Failed to load report data';
      reportData.value = [];
      reportSummary.value = {};
      chartData.value = {};
      
      // Track failed data load
      trackDataLoad('error', 0, err.message);
      
      // Don't show error toast for user-initiated actions
      if (!forceRefresh) {
        handleError(err, mainStore.loading);
      }
    } finally {
      loading.value = false;
    }
  };

  const prepareChartData = async () => {
    if (!report.value?.chartConfig || !hasData.value) {
      chartData.value = {};
      return;
    }

    const config = report.value.chartConfig;
    
    try {
      if (config.type === 'bar' || config.type === 'line') {
        await prepareBarLineChartData(config);
      } else if (config.type === 'doughnut' || config.type === 'pie') {
        await prepareDoughnutPieChartData(config);
      } else if (config.type === 'radar') {
        await prepareRadarChartData(config);
      } else if (config.type === 'polarArea') {
        await preparePolarAreaChartData(config);
      }
    } catch (error) {
      console.error('Failed to prepare chart data:', error);
      chartData.value = {};
    }
  };

  const prepareBarLineChartData = async (config) => {
    const labels = [...new Set(reportData.value.map(item => item[config.xField]))];
    const data = labels.map(label => {
      const items = reportData.value.filter(item => item[config.xField] === label);
      return items.reduce((sum, item) => sum + (parseFloat(item[config.yField]) || 0), 0);
    });
    
    chartData.value = {
      labels,
      datasets: [{
        label: config.title,
        data,
        backgroundColor: config.type === 'bar' 
          ? 'rgba(54, 162, 235, 0.8)' 
          : 'rgba(75, 192, 192, 0.2)',
        borderColor: config.type === 'bar' 
          ? 'rgba(54, 162, 235, 1)' 
          : 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: config.type === 'line',
        tension: config.type === 'line' ? 0.4 : 0
      }]
    };
  };

  const prepareDoughnutPieChartData = async (config) => {
    const groupedData = reportData.value.reduce((acc, item) => {
      const key = item[config.labelField];
      const value = parseFloat(item[config.valueField]) || 0;
      acc[key] = (acc[key] || 0) + value;
      return acc;
    }, {});
    
    chartData.value = {
      labels: Object.keys(groupedData),
      datasets: [{
        data: Object.values(groupedData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 2
      }]
    };
  };

  const prepareRadarChartData = async (config) => {
    // Radar chart implementation
    const labels = [...new Set(reportData.value.map(item => item[config.labelField]))];
    const data = labels.map(label => {
      const items = reportData.value.filter(item => item[config.labelField] === label);
      return items.reduce((sum, item) => sum + (parseFloat(item[config.valueField]) || 0), 0);
    });
    
    chartData.value = {
      labels,
      datasets: [{
        label: config.title,
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };
  };

  const preparePolarAreaChartData = async (config) => {
    // Similar to doughnut but for polar area
    await prepareDoughnutPieChartData(config);
  };

  const refreshData = () => {
    return loadReportData(true);
  };

  const clearData = () => {
    reportData.value = [];
    reportSummary.value = {};
    chartData.value = {};
    error.value = null;
    lastFetchTime.value = null;
  };

  const trackDataLoad = (status, recordCount, errorMessage = null) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'report_data_load', {
        report_id: report.value?.id,
        status,
        record_count: recordCount,
        error_message: errorMessage
      });
    }
  };

  const exportDataAsJSON = () => {
    if (!hasData.value) return null;
    
    const exportData = {
      report: {
        id: report.value.id,
        name: report.value.name,
        generated: new Date().toISOString()
      },
      summary: reportSummary.value,
      data: reportData.value,
      metadata: {
        totalRows: reportData.value.length,
        columns: report.value.columns?.map(col => col.field) || []
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  // Watch for filter changes and auto-reload data
  watch(
    [filterValues, isFormValid],
    ([newFilterValues, newIsValid], [oldFilterValues, oldIsValid]) => {
      // Only reload if form is valid and filters have actually changed
      if (newIsValid && report.value?.dataEndpoint) {
        // Add debounce to avoid too many requests
        clearTimeout(loadReportData.debounceTimer);
        loadReportData.debounceTimer = setTimeout(() => {
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
    loading,
    error,
    lastFetchTime,
    
    // Computed
    hasData,
    hasSummary,
    hasChartData,
    dataStats,
    
    // Methods
    loadReportData,
    refreshData,
    clearData,
    exportDataAsJSON
  };
}