// composables/useReportFilters.js
import { ref, reactive, watch } from 'vue';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useMainStore } from '@/stores/mainStore';

export function useReportFilters() {
  const mainStore = useMainStore();
  const loading = ref(false);
  const filterOptions = reactive({});
  const filterValues = reactive({});

  // Cache for API responses to avoid duplicate calls
  const optionsCache = new Map();

  const initializeFilters = (filters) => {
    // Clear existing values
    Object.keys(filterValues).forEach(key => {
      delete filterValues[key];
    });

    // Initialize with defaults
    filters.forEach((filter) => {
      switch (filter.type) {
        case 'date':
        case 'datetime':
          filterValues[filter.name] = filter.default || new Date();
          break;
        case 'daterange':
          filterValues[filter.startDate] = filter.default?.startDate || null;
          filterValues[filter.endDate] = filter.default?.endDate || null;
          break;
        case 'dropdown':
          filterValues[filter.name] = null;
          break;
        case 'multiselect':
          filterValues[filter.name] = [];
          break;
        case 'checkbox':
          filterValues[filter.name] = filter.default || false;
          break;
        case 'radio':
          filterValues[filter.name] = filter.default || filter.options?.[0]?.value;
          break;
        default:
          filterValues[filter.name] = filter.default || null;
      }
    });
  };

  const loadFilterOptions = async (filters) => {
    if (!filters || filters.length === 0) return;

    loading.value = true;
    try {
      // Clear existing options
      Object.keys(filterOptions).forEach(key => {
        delete filterOptions[key];
      });

      // Load options for filters that need API data
      const apiCalls = filters
        .filter(filter => 
          (filter.type === 'dropdown' || filter.type === 'multiselect') && 
          filter.endpoint
        )
        .map(async (filter) => {
          // Check cache first
          const cacheKey = filter.endpoint;
          if (optionsCache.has(cacheKey)) {
            filterOptions[filter.name] = optionsCache.get(cacheKey);
            return;
          }

          try {
            const response = await apiClient.get(filter.endpoint);
            if (response.data.success) {
              const options = response.data.data;
              filterOptions[filter.name] = options;
              // Cache the response
              optionsCache.set(cacheKey, options);
            }
          } catch (error) {
            console.error(`Failed to load options for ${filter.name}:`, error);
            filterOptions[filter.name] = [];
          }
        });

      await Promise.all(apiCalls);
    } catch (err) {
      handleError(err, mainStore.loading);
    } finally {
      loading.value = false;
    }
  };

  const validateFilters = (filters) => {
    for (const filter of filters) {
      if (filter.required) {
        if (filter.type === 'daterange') {
          if (!filterValues[filter.startDate] || !filterValues[filter.endDate]) {
            return false;
          }
        } else if (filter.type === 'multiselect') {
          if (!filterValues[filter.name] || filterValues[filter.name].length === 0) {
            return false;
          }
        } else if (!filterValues[filter.name]) {
          return false;
        }
      }
    }
    return true;
  };

  const prepareFilterPayload = (filters) => {
    const payload = {};

    filters.forEach((filter) => {
      if (filter.type === 'daterange') {
        const startValue = filterValues[filter.startDate];
        const endValue = filterValues[filter.endDate];
        
        if (startValue) {
          payload[filter.startDate] = startValue.toISOString();
        }
        if (endValue) {
          payload[filter.endDate] = endValue.toISOString();
        }
      } else {
        const value = filterValues[filter.name];
        if (value !== null && value !== undefined && value !== '') {
          if (filter.type === 'date' && value instanceof Date) {
            payload[filter.name] = value.toISOString();
          } else {
            payload[filter.name] = value;
          }
        }
      }
    });

    return payload;
  };

  const resetFilters = () => {
    Object.keys(filterValues).forEach(key => {
      delete filterValues[key];
    });
    Object.keys(filterOptions).forEach(key => {
      delete filterOptions[key];
    });
  };

  const clearCache = () => {
    optionsCache.clear();
  };

  // Watch for changes in filter values and emit events if needed
  const setupFilterWatchers = (filters, callback) => {
    if (!callback) return;

    const watchers = filters.map(filter => {
      if (filter.type === 'daterange') {
        return [
          watch(() => filterValues[filter.startDate], callback, { deep: true }),
          watch(() => filterValues[filter.endDate], callback, { deep: true })
        ];
      } else {
        return watch(() => filterValues[filter.name], callback, { deep: true });
      }
    }).flat();

    return () => {
      watchers.forEach(unwatch => unwatch());
    };
  };

  return {
    // State
    loading,
    filterOptions,
    filterValues,
    
    // Methods
    initializeFilters,
    loadFilterOptions,
    validateFilters,
    prepareFilterPayload,
    resetFilters,
    clearCache,
    setupFilterWatchers
  };
}