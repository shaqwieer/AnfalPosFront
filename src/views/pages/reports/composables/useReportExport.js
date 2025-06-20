import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useReportFilters } from './useReportFilters';

export function useReportExport(report) {
  const { t } = useI18n();
  const mainStore = useMainStore();
  
  // Get filter composable
  const { isFormValid, prepareFilterPayload } = useReportFilters(report);
  
  // Reactive state
  const exporting = ref(false);
  const exportProgress = ref(0);
  const exportHistory = ref([]);

  // Computed properties
  const canExport = computed(() => {
    return report.value && isFormValid.value && !exporting.value;
  });

  const hasExportType = (reportConfig, type) => {
    if (!reportConfig) return false;
    return type === 'pdf' ? !!reportConfig.pdfEndpoint : !!reportConfig.excelEndpoint;
  };

  const getAvailableExportTypes = computed(() => {
    if (!report.value) return [];
    
    const types = [];
    if (report.value.pdfEndpoint) types.push('pdf');
    if (report.value.excelEndpoint) types.push('excel');
    
    return types;
  });

  // Methods
  const exportReport = async (type, options = {}) => {
    if (!canExport.value) {
      mainStore.loading.setNotificationInfo('warning', t('reports.cannotExport'));
      return false;
    }

    const endpoint = type === 'pdf' ? report.value.pdfEndpoint : report.value.excelEndpoint;
    const method = type === 'pdf' ? report.value.pdfMethod : report.value.excelMethod;
    
    if (!endpoint) {
      mainStore.loading.setNotificationInfo('warning', t('reports.exportNotAvailable'));
      return false;
    }

    exporting.value = true;
    exportProgress.value = 0;

    try {
      // Prepare payload with proper transformations
      const payload = prepareFilterPayload(type);
      
      // Add any additional options
      if (options.includeCharts !== undefined) {
        payload.includeCharts = options.includeCharts;
      }
      if (options.pageSize) {
        payload.pageSize = options.pageSize;
      }
      if (options.orientation) {
        payload.orientation = options.orientation;
      }

      exportProgress.value = 25;

      // Make the export request
      const response = await apiClient({
        url: endpoint,
        method: method || 'POST',
        data: payload,
        responseType: 'blob',
        timeout: 120000, // 2 minutes timeout for exports
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            exportProgress.value = Math.min(25 + (progress * 0.7), 95);
          }
        }
      });

      exportProgress.value = 95;

      // Handle the file download
      const success = await downloadFile(response, type, options.filename);
      
      if (success) {
        exportProgress.value = 100;
        
        // Add to export history
        addToExportHistory(type, payload);
        
        // Show success message
        mainStore.loading.setNotificationInfo('success', t('reports.exportSuccess'));
        
        // Track export success
        trackExport('success', type);
        
        return true;
      } else {
        throw new Error('Failed to download file');
      }

    } catch (err) {
      console.error('Export failed:', err);
      
      // Track export failure
      trackExport('error', type, err.message);
      
      // Handle specific error types
      if (err.code === 'ECONNABORTED') {
        mainStore.loading.setNotificationInfo('error', t('reports.exportTimeout'));
      } else if (err.response?.status === 413) {
        mainStore.loading.setNotificationInfo('error', t('reports.exportTooLarge'));
      } else if (err.response?.status === 429) {
        mainStore.loading.setNotificationInfo('error', t('reports.exportRateLimit'));
      } else {
        handleError(err, mainStore.loading);
      }
      
      return false;
    } finally {
      exporting.value = false;
      exportProgress.value = 0;
    }
  };

  const downloadFile = async (response, type, customFilename = null) => {
    try {
      // Determine content type and extension
      const contentType = type === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = type === 'pdf' ? 'pdf' : 'xlsx';
      
      // Create blob
      const blob = new Blob([response.data], { type: contentType });
      
      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = customFilename || `${report.value.id}-${timestamp}.${fileExtension}`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  };

  const exportMultipleFormats = async (formats = ['pdf', 'excel'], options = {}) => {
    const results = {};
    
    for (const format of formats) {
      if (hasExportType(report.value, format)) {
        try {
          results[format] = await exportReport(format, options);
        } catch (error) {
          results[format] = false;
        }
      } else {
        results[format] = false;
      }
    }
    
    return results;
  };

  const scheduleExport = async (type, schedule, options = {}) => {
    // This would typically integrate with a backend scheduling service
    try {
      const payload = {
        reportId: report.value.id,
        exportType: type,
        schedule,
        filters: prepareFilterPayload(type),
        options
      };
      
      const response = await apiClient.post('/reports/schedule-export', payload);
      
      if (response.data.success) {
        mainStore.loading.setNotificationInfo('success', t('reports.exportScheduled'));
        return response.data.scheduleId;
      }
    } catch (error) {
      handleError(error, mainStore.loading);
    }
    
    return null;
  };

  const addToExportHistory = (type, filters) => {
    const historyItem = {
      id: Date.now(),
      reportId: report.value.id,
      reportName: report.value.name,
      type,
      timestamp: new Date(),
      filters: { ...filters },
      success: true
    };
    
    exportHistory.value.unshift(historyItem);
    
    // Keep only last 10 exports
    if (exportHistory.value.length > 10) {
      exportHistory.value = exportHistory.value.slice(0, 10);
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('reportExportHistory', JSON.stringify(exportHistory.value));
    } catch (error) {
      console.warn('Failed to save export history:', error);
    }
  };

  const loadExportHistory = () => {
    try {
      const stored = localStorage.getItem('reportExportHistory');
      if (stored) {
        exportHistory.value = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load export history:', error);
      exportHistory.value = [];
    }
  };

  const clearExportHistory = () => {
    exportHistory.value = [];
    try {
      localStorage.removeItem('reportExportHistory');
    } catch (error) {
      console.warn('Failed to clear export history:', error);
    }
  };

  const trackExport = (status, type, errorMessage = null) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'report_export', {
        report_id: report.value?.id,
        export_type: type,
        status,
        error_message: errorMessage
      });
    }
  };

  const getExportOptions = (type) => {
    const baseOptions = {
      includeCharts: true,
      timestamp: true
    };
    
    if (type === 'pdf') {
      return {
        ...baseOptions,
        pageSize: 'A4',
        orientation: 'portrait',
        margins: 'normal'
      };
    } else if (type === 'excel') {
      return {
        ...baseOptions,
        includeFormulas: false,
        autoFilter: true,
        freezeHeaders: true
      };
    }
    
    return baseOptions;
  };

  // Load export history on initialization
  loadExportHistory();

  return {
    // State
    exporting,
    exportProgress,
    exportHistory,
    
    // Computed
    canExport,
    getAvailableExportTypes,
    
    // Methods
    exportReport,
    exportMultipleFormats,
    scheduleExport,
    hasExportType,
    getExportOptions,
    clearExportHistory,
    loadExportHistory
  };
}