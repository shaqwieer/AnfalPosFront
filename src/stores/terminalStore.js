import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { terminalService } from '@/api/terminalService';
import { useLoadingStore } from './loaderStore';
import { handleError } from '@/utilities/errorHandler';

export const useTerminalStore = defineStore('terminal', () => {
  // State
  const terminalInfo = ref({});
  const sessionDetails = ref({});
  const loading = ref(false);
  const sessionLoading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);
  const refreshInterval = ref(null);
  const loadingStore = useLoadingStore();

  // Getters
  const getTerminalInfo = computed(() => terminalInfo.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  
  // Session-related getters
  const isSessionOpened = computed(() => terminalInfo.value.isSessionOpened || false);
  const sessionOpenDate = computed(() => terminalInfo.value.openSessionDate || null);
  const currentCash = computed(() => terminalInfo.value.currentCash || 0);
  const cashJournal = computed(() => terminalInfo.value.cashJournal || '');
  const cashCustomer = computed(() => terminalInfo.value.cashCustomer || '');
  
  // Branch-related getters
  const branchId = computed(() => terminalInfo.value.branchId || null);
  const branchName = computed(() => terminalInfo.value.branchName || '');
  const salesRepCode = computed(() => terminalInfo.value.salesRepCode || '');
  
  // Business settings getters
  const isBusinessToBusiness = computed(() => terminalInfo.value.isBusinessToBusiness || false);
  const canEditPrice = computed(() => terminalInfo.value.canEditPrice || false);
  const selectBatch = computed(() => terminalInfo.value.selectBatch || false);

  // Helper function to get user timezone
  const getUserTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.warn('Could not detect timezone, using default');
      return 'Africa/Cairo';
    }
  };

  // Actions
  const fetchTerminalInfo = async (timezone = null) => {
    loading.value = true;
    error.value = null;
    
    try {
      const ianaZone = timezone || getUserTimezone();
      const data = await terminalService.getTerminalInformationForPos(ianaZone);
      terminalInfo.value = data;
      lastUpdated.value = new Date();
      return data;
    } catch (err) {
      error.value = handleError(err, loadingStore);
      console.warn('Failed to fetch terminal information from API');
    } finally {
      loading.value = false;
    }
  };




  // Initialize terminal info
  const initializeTerminal = async () => {
    await fetchTerminalInfo();
  };

  // Format session date for display
  const getFormattedSessionDate = computed(() => {
    if (!sessionOpenDate.value) return '';
    
    try {
      const date = new Date(sessionOpenDate.value);
      return date.toLocaleString();
    } catch (error) {
      return sessionOpenDate.value;
    }
  });

  // Get session duration
  const getSessionDuration = computed(() => {
    if (!sessionOpenDate.value) return '';
    
    try {
      const startDate = new Date(sessionOpenDate.value);
      const now = new Date();
      const diffMs = now - startDate;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return '';
    }
  });

  // Session operations
  const openSession = async () => {
    sessionLoading.value = true;
    error.value = null;

    try {
      const result = await terminalService.openShiftSession();
      // Refresh terminal info after opening session
      await fetchTerminalInfo();
      return result;
    } catch (err) {
      error.value = handleError(err, loadingStore);
      throw err;
    } finally {
      sessionLoading.value = false;
    }
  };

  const getSessionDetailsForClosing = async () => {
    sessionLoading.value = true;
    error.value = null;

    try {
      // Use the new method that finds the active session automatically
      const details = await terminalService.getCurrentActiveSessionDetails();
      sessionDetails.value = details;
      return details;
    } catch (err) {
      error.value = handleError(err, loadingStore);
      throw err;
    } finally {
      sessionLoading.value = false;
    }
  };

  const closeSession = async (closeParams) => {
    sessionLoading.value = true;
    error.value = null;

    try {
      // If no session ID provided, use the one from session details
      if (!closeParams.shiftSessionId && sessionDetails.value.sessionId) {
        closeParams.shiftSessionId = sessionDetails.value.sessionId;
      }

      const result = await terminalService.closeShiftSession(closeParams);
      // Refresh terminal info after closing session
      await fetchTerminalInfo();
      // Clear session details
      sessionDetails.value = {};
      return result;
    } catch (err) {
      error.value = handleError(err, loadingStore);
      throw err;
    } finally {
      sessionLoading.value = false;
    }
  };

  // Cleanup on store destruction
  const cleanup = () => {
  };

  return {
    // State
    terminalInfo,
    sessionDetails,
    loading,
    sessionLoading,
    error,
    lastUpdated,

    // Getters
    getTerminalInfo,
    isLoading,
    hasError,
    isSessionOpened,
    sessionOpenDate,
    currentCash,
    cashJournal,
    cashCustomer,
    branchId,
    branchName,
    salesRepCode,
    isBusinessToBusiness,
    canEditPrice,
    selectBatch,
    getFormattedSessionDate,
    getSessionDuration,

    // Actions
    fetchTerminalInfo,
    initializeTerminal,
    openSession,
    getSessionDetailsForClosing,
    closeSession,
    cleanup
  };
});
