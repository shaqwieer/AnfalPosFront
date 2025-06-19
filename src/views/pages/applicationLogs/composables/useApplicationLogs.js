import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export function useApplicationLogs() {
  const { t } = useI18n();
  const mainStore = useMainStore();
  
  const logs = ref([]);
  const selectedLog = ref(null);
  const logDetailVisible = ref(false);
  const loading = ref(false);

  const filters = reactive({
    level: null,
    searchTerm: '',
    fromDate: new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000), // Yesterday
    toDate: new Date(new Date().setHours(23, 59, 59, 999)), // Today end
    requestPath: ''
  });

  const logStats = computed(() => {
    if (!logs.value.length) return null;
    
    const totalLogs = logs.value.length;
    const errorCount = logs.value.filter(log => 
      log.level?.toLowerCase() === 'error' || log.level?.toLowerCase() === 'critical'
    ).length;
    const warningCount = logs.value.filter(log => 
      log.level?.toLowerCase() === 'warning'
    ).length;
    const infoCount = logs.value.filter(log => 
      log.level?.toLowerCase() === 'information'
    ).length;
    
    // Level distribution
    const levelDistribution = logs.value.reduce((acc, log) => {
      const level = log.level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalLogs,
      errorCount,
      warningCount,
      infoCount,
      levelDistribution
    };
  });

  const selectLog = (log) => {
    selectedLog.value = log;
    logDetailVisible.value = true;
  };

  const searchLogs = async () => {
    loading.value = true;
    try {
      const payload = {
        level: filters.level || undefined,
        searchTerm: filters.searchTerm || undefined,
        fromDate: filters.fromDate?.toISOString(),
        toDate: filters.toDate?.toISOString(),
        requestPath: filters.requestPath || undefined,
        ianaZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await apiClient.post('/MobileVersions/SearchApplicationLogsAsync', payload);
      
      if (response.data.success) {
        logs.value = response.data.data || [];
      } else {
        logs.value = [];
        // Handle error case
        console.error('Search failed:', response.data.message);
      }
    } catch (err) {
      logs.value = [];
      handleError(err, mainStore.loading);
    } finally {
      loading.value = false;
    }
  };

  return {
    logs,
    selectedLog,
    logDetailVisible,
    logStats,
    filters,
    loading,
    selectLog,
    searchLogs
  };
}