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
      // if (reports.value.length > 0 && !selectedReport.value) {
        // selectReport(reports.value[0]);
      // }
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
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'report_selected', {
    //     report_id: report.id,
    //     report_name: report.name,
    //     report_category: report.category
    //   });
    // }
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
    initializeReports
  };
}