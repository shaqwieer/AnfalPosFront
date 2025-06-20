import { ref, onMounted } from 'vue';
import { reportConfigs } from '../config/reportConfigs';

export function useReports() {
  // Reactive state
  const reports = ref([]);
  const selectedReport = ref(null);
  const loading = ref(false);

  // Methods
  const initializeReports = () => {
    loading.value = true;
    try {
      reports.value = reportConfigs;
      
      // Auto-select first report if available
      if (reports.value.length > 0 && !selectedReport.value) {
        selectReport(reports.value[0]);
      }
    } catch (error) {
      console.error('Failed to initialize reports:', error);
    } finally {
      loading.value = false;
    }
  };

  const selectReport = (report) => {
    if (!report) return;
    
    selectedReport.value = report;
    
    // Emit event for analytics/tracking if needed
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'report_selected', {
        report_id: report.id,
        report_name: report.name,
        report_category: report.category
      });
    }
  };

  const getReportById = (reportId) => {
    return reports.value.find(report => report.id === reportId);
  };

  const getReportsByCategory = (category) => {
    if (!category || category === 'all') {
      return reports.value;
    }
    return reports.value.filter(report => report.category === category);
  };

  const getAvailableCategories = () => {
    const categories = [...new Set(reports.value.map(r => r.category))];
    return categories.map(cat => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat
    }));
  };

  const getReportCapabilities = (report) => {
    if (!report) return {};
    
    return {
      hasData: !!report.dataEndpoint,
      hasExcel: !!report.excelEndpoint,
      hasPdf: !!report.pdfEndpoint,
      hasChart: !!report.chartConfig,
      hasSummary: !!(report.summaryCards && report.summaryCards.length > 0),
      hasTable: !!(report.columns && report.columns.length > 0),
      hasFilters: !!(report.filters && report.filters.length > 0)
    };
  };

  const validateReportConfig = (report) => {
    const errors = [];
    
    if (!report.id) errors.push('Report ID is required');
    if (!report.name) errors.push('Report name is required');
    if (!report.dataEndpoint && !report.pdfEndpoint && !report.excelEndpoint) {
      errors.push('At least one endpoint (data, PDF, or Excel) is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Initialize on mount
  onMounted(() => {
    initializeReports();
  });

  return {
    // State
    reports,
    selectedReport,
    loading,
    
    // Methods
    selectReport,
    getReportById,
    getReportsByCategory,
    getAvailableCategories,
    getReportCapabilities,
    validateReportConfig,
    initializeReports
  };
}