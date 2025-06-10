import { ref, reactive, computed, onMounted } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export function useTransactionFilters() {
  const mainStore = useMainStore();
  
  const selectedCustomer = ref(null);
  const customers = ref([]);
  const loading = ref(false);

  const filters = reactive({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    toDate: new Date(),
    customerId: null
  });

  const isFiltersValid = computed(() => {
    return selectedCustomer.value && filters.fromDate && filters.toDate;
  });

  const loadCustomers = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get('/Customers/GetPartnerCustomerForOrganization');
      if (response.data.success) {
        customers.value = response.data.data;
      }
    } catch (err) {
      handleError(err, mainStore.loading);
    } finally {
      loading.value = false;
    }
  };

  return {
    selectedCustomer,
    filters,
    customers,
    isFiltersValid,
    loading,
    loadCustomers
  };
}