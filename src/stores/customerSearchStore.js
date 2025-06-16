import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { customerService } from '@/api/customerService';
import { useLoadingStore } from './loaderStore';
import { handleError } from '@/utilities/errorHandler';

export const useCustomerSearchStore = defineStore('customerSearch', () => {
  // State
  const customers = ref([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalCount = ref(0);
  const loading = ref(false);
  const error = ref(null);
  const searchKey = ref('');
  const isNotBusinessPartner = ref(true); // true for individual, false for business
  const loadingStore = useLoadingStore();

  // Getters
  const getCustomers = computed(() => customers.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const hasPreviousPage = computed(() => currentPage.value > 1);
  const hasNextPage = computed(() => currentPage.value < totalPages.value);
  const getPaginationInfo = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    totalCount: totalCount.value,
    pageSize: pageSize.value,
    hasPreviousPage: hasPreviousPage.value,
    hasNextPage: hasNextPage.value
  }));

  // Helper function to transform API customer to UI format
  const transformApiCustomer = (apiCustomer) => {
    return {
      id: apiCustomer.id,
      uniqueIdentifier: apiCustomer.uniqueIdentifier,
      name: apiCustomer.name,
      type: apiCustomer.isBusinessPartner ? 'business' : 'individual',
      mobile: apiCustomer.primaryPhone,
      email: apiCustomer.email,
      sapCustomer: apiCustomer.sapCustomer,
      crNumber: apiCustomer.crNumber,
      vatNumber: apiCustomer.vatNumber,
      creditLimit: apiCustomer.creditLimit,
      availableBalance: apiCustomer.availableBalance,
      outStandingBalance: apiCustomer.outStandingBalance,
      paymentTerm: apiCustomer.paymentTerm,
      city: apiCustomer.city,
      district: apiCustomer.district,
      streetName: apiCustomer.streetName,
      buildingNumber: apiCustomer.buildingNumber,
      postalCode: apiCustomer.postalCode,
      statusName: apiCustomer.statusName,
      regionName: apiCustomer.regionName,
      branchName: apiCustomer.branchName,
      isBusinessPartner: apiCustomer.isBusinessPartner,
      inVisit: apiCustomer.inVisit,
      // Add default vehicle data for compatibility with existing UI
      vehicles: [{
        plateNo: 'N/A',
        make: 'N/A',
        model: 'N/A',
        year: 'N/A',
        vin: 'N/A'
      }]
    };
  };

  // Actions
  const searchCustomers = async (searchParams = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const params = {
        pageNumber: searchParams.pageNumber || currentPage.value,
        pageSize: searchParams.pageSize || pageSize.value,
        isNotBusinessPartner: searchParams.isNotBusinessPartner !== undefined
          ? searchParams.isNotBusinessPartner
          : isNotBusinessPartner.value
      };

      // Only add searchKey if it has a value
      const searchKeyValue = searchParams.searchKey !== undefined
        ? searchParams.searchKey
        : searchKey.value;

      if (searchKeyValue && searchKeyValue.trim()) {
        params.searchKey = searchKeyValue.trim();
      }

      const response = await customerService.getCustomerForPosPaginated(params);
      
      // Update state with response data
      customers.value = response.items?.map(transformApiCustomer) || [];
      currentPage.value = response.pageIndex || 1;
      totalPages.value = response.totalPages || 0;
      totalCount.value = response.totalCount || 0;
      
      return response;
    } catch (err) {
      error.value = handleError(err, loadingStore);
      customers.value = [];
      console.warn('Failed to fetch customers from API, using empty array');
    } finally {
      loading.value = false;
    }
  };

  const setSearchKey = (key) => {
    searchKey.value = key;
  };

  const setCustomerType = (isNotBusiness) => {
    isNotBusinessPartner.value = isNotBusiness;
  };

  const nextPage = async () => {
    if (hasNextPage.value) {
      currentPage.value++;
      await searchCustomers();
    }
  };

  const previousPage = async () => {
    if (hasPreviousPage.value) {
      currentPage.value--;
      await searchCustomers();
    }
  };

  const goToPage = async (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      await searchCustomers();
    }
  };

  const resetSearch = () => {
    searchKey.value = '';
    currentPage.value = 1;
    customers.value = [];
    error.value = null;
  };

  return {
    // State
    customers,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    loading,
    error,
    searchKey,
    isNotBusinessPartner,

    // Getters
    getCustomers,
    isLoading,
    hasError,
    hasPreviousPage,
    hasNextPage,
    getPaginationInfo,

    // Actions
    searchCustomers,
    setSearchKey,
    setCustomerType,
    nextPage,
    previousPage,
    goToPage,
    resetSearch
  };
});
