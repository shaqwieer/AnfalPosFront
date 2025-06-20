import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { validateFilters } from '../utils/validators';

export function useReportFilters(report) {
  const mainStore = useMainStore();
  
  // Reactive state
  const filterValues = reactive({});
  const filterOptions = reactive({});
  const loading = ref(false);
  const validationErrors = ref({});

  // Computed properties
  const isFormValid = computed(() => {
    if (!report.value) return false;
    
    const validation = validateFilters(report.value.filters, filterValues);
    validationErrors.value = validation.errors;
    
    return validation.isValid;
  });

  const hasRequiredFields = computed(() => {
    return report.value?.filters?.some(filter => filter.required) || false;
  });

  const appliedFiltersCount = computed(() => {
    return Object.keys(filterValues).filter(key => {
      const value = filterValues[key];
      return value !== null && value !== undefined && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  });

  // Methods
  const resetFilterValues = async () => {
    if (!report.value) return;

    // Clear existing values
    Object.keys(filterValues).forEach(key => {
      delete filterValues[key];
    });

    // Set default values
    report.value.filters.forEach((filter) => {
      if (filter.type === 'date') {
        filterValues[filter.name] = filter.default || new Date();
      } else if (filter.type === 'daterange') {
        filterValues[filter.startDate] = filter.default?.startDate || null;
        filterValues[filter.endDate] = filter.default?.endDate || null;
      } else if (filter.type === 'dropdown') {
        filterValues[filter.name] = filter.default || null;
      } else if (filter.type === 'multiselect') {
        filterValues[filter.name] = filter.default || [];
      } else if (filter.type === 'checkbox') {
        filterValues[filter.name] = filter.default || false;
      } else if (filter.type === 'radio') {
        filterValues[filter.name] = filter.default || filter.options?.[0]?.value || null;
      } else {
        filterValues[filter.name] = filter.default || null;
      }
    });

    // Clear validation errors
    validationErrors.value = {};
  };

  const loadFilterOptions = async () => {
    if (!report.value) return;

    loading.value = true;
    const loadPromises = [];

    try {
      for (const filter of report.value.filters) {
        if ((filter.type === 'dropdown' || filter.type === 'multiselect') && filter.endpoint) {
          const promise = loadFilterOption(filter);
          loadPromises.push(promise);
        }
      }

      await Promise.all(loadPromises);
    } catch (err) {
      console.error('Failed to load filter options:', err);
      handleError(err, mainStore.loading);
    } finally {
      loading.value = false;
    }
  };

  const loadFilterOption = async (filter) => {
    try {
      const response = await apiClient.get(filter.endpoint);
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Handle lookup key if specified
        if (filter.lookupKey && data[filter.lookupKey]) {
          filterOptions[filter.name] = data[filter.lookupKey];
        } else if (Array.isArray(data)) {
          filterOptions[filter.name] = data;
        } else {
          filterOptions[filter.name] = [];
        }
      } else {
        filterOptions[filter.name] = [];
      }
    } catch (error) {
      console.error(`Failed to load options for filter ${filter.name}:`, error);
      filterOptions[filter.name] = [];
    }
  };

  const clearFilters = () => {
    Object.keys(filterValues).forEach(key => {
      const filter = report.value.filters.find(f => 
        f.name === key || f.startDate === key || f.endDate === key
      );
      
      if (filter) {
        if (filter.type === 'multiselect') {
          filterValues[key] = [];
        } else if (filter.type === 'checkbox') {
          filterValues[key] = false;
        } else {
          filterValues[key] = null;
        }
      }
    });
    
    validationErrors.value = {};
  };

  const getFilterValue = (filterName) => {
    return filterValues[filterName];
  };

  const setFilterValue = (filterName, value) => {
    filterValues[filterName] = value;
  };

  const prepareFilterPayload = (transformType = 'data') => {
    const payload = {};
    
    report.value.filters.forEach((filter) => {
      if (filter.type === 'daterange') {
        const startValue = filterValues[filter.startDate];
        const endValue = filterValues[filter.endDate];
        
        if (startValue) payload[filter.startDate] = startValue.toISOString();
        if (endValue) payload[filter.endDate] = endValue.toISOString();
      } else {
        const value = filterValues[filter.name];
        
        if (value !== null && value !== undefined && value !== '') {
          // Handle special transformations for different endpoints
          if (transformType === 'pdf' && filter.pdfTransform) {
            const transformed = filter.pdfTransform(value);
            Object.assign(payload, transformed);
          } else if (transformType === 'excel' && filter.excelTransform) {
            const transformed = filter.excelTransform(value);
            Object.assign(payload, transformed);
          } else {
            // For multiselect, only include if not empty
            if (Array.isArray(value) && value.length === 0) {
              return;
            }
            payload[filter.name] = value;
          }
        }
      }
    });
    
    return payload;
  };

  const getFilterSummary = () => {
    const summary = [];
    
    report.value.filters.forEach(filter => {
      if (filter.type === 'daterange') {
        const startValue = filterValues[filter.startDate];
        const endValue = filterValues[filter.endDate];
        
        if (startValue || endValue) {
          summary.push({
            label: filter.label,
            value: `${startValue ? startValue.toLocaleDateString() : ''} - ${endValue ? endValue.toLocaleDateString() : ''}`
          });
        }
      } else {
        const value = filterValues[filter.name];
        
        if (value !== null && value !== undefined && value !== '') {
          let displayValue = value;
          
          // Format display value based on type
          if (Array.isArray(value)) {
            displayValue = `${value.length} selected`;
          } else if (filter.type === 'date') {
            displayValue = value.toLocaleDateString();
          } else if (filter.type === 'dropdown' && filter.optionLabel) {
            const option = filterOptions[filter.name]?.find(opt => opt[filter.optionValue] === value);
            displayValue = option ? option[filter.optionLabel] : value;
          }
          
          summary.push({
            label: filter.label,
            value: displayValue
          });
        }
      }
    });
    
    return summary;
  };

  // Watch for report changes
  watch(report, async (newReport) => {
    if (newReport) {
      await resetFilterValues();
      await loadFilterOptions();
    }
  }, { immediate: true });

  // Watch for dependent filter changes
  const setupDependentFilters = () => {
    report.value?.filters?.forEach(filter => {
      if (filter.dependsOn) {
        watch(
          () => filterValues[filter.dependsOn],
          async (newValue) => {
            if (newValue) {
              // Clear dependent filter value
              filterValues[filter.name] = filter.type === 'multiselect' ? [] : null;
              
              // Reload options for dependent filter
              if (filter.endpoint) {
                await loadFilterOption(filter);
              }
            }
          }
        );
      }
    });
  };

  // Initialize dependent filters
  nextTick(() => {
    setupDependentFilters();
  });

  return {
    // State
    filterValues,
    filterOptions,
    loading,
    validationErrors,
    
    // Computed
    isFormValid,
    hasRequiredFields,
    appliedFiltersCount,
    
    // Methods
    resetFilterValues,
    loadFilterOptions,
    clearFilters,
    getFilterValue,
    setFilterValue,
    prepareFilterPayload,
    getFilterSummary
  };
}