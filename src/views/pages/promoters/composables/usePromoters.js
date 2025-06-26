import { ref } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export function usePromoters() {
  const mainStore = useMainStore();

  // State
  const promoters = ref([]);
  const filteredPromoters = ref([]); // What will be shown in the UI
  const branches = ref([]);
  const loading = ref(false);
  const totalRecords = ref(0);

  // API Methods
  const loadPromoters = async (params = {}) => {
    loading.value = true;
    try {
      // const queryParams = {
      //   page: params.page || 0,
      //   size: params.rows || 10,
      //   sort: params.sortField || 'name',
      //   direction: params.sortOrder === 1 ? 'asc' : 'desc',
      //   search: params.search || '',
      //   branchId: params.branchId || null
      // };

      // // Remove null/undefined params
      // Object.keys(queryParams).forEach(key => {
      //   if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
      //     delete queryParams[key];
      //   }
      // });

      const response = await apiClient.get('/Promoters');
      //   , {
      //   params: queryParams
      // });

      promoters.value = response.data.data;
      filteredPromoters.value = response.data.data; 
      totalRecords.value = response.data.data.length;
    } catch (err) {
      handleError(err, mainStore.loading);
      promoters.value = [];
      totalRecords.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const loadBranches = async () => {
    try {
      const response = await apiClient.get('/BusinessEntities/GetUserVanSaleInBranch');
      branches.value = response.data.data;
    } catch (err) {
      handleError(err, mainStore.loading);
      branches.value = [];
    }
  };

  const createPromoter = async (promoterData) => {
    try {
      const response = await apiClient.post('/Promoters', promoterData);
      return response.data;
    } catch (err) {
      handleError(err, mainStore.loading);
      throw err;
    }
  };

  const updatePromoter = async (id, promoterData) => {
    try {
      const response = await apiClient.put(`/Promoters/${id}`, promoterData);
      return response.data;
    } catch (err) {
      handleError(err, mainStore.loading);
      throw err;
    }
  };

  const deletePromoter = async (id) => {
    try {
      const response = await apiClient.delete(`/Promoters/${id}`);
      return response.data;
    } catch (err) {
      handleError(err, mainStore.loading);
      throw err;
    }
  };

  const getPromoter = async (id) => {
    try {
      const response = await apiClient.get(`/Promoters/${id}`);
      return response.data.data;
    } catch (err) {
      handleError(err, mainStore.loading);
      throw err;
    }
  };

  // Export methods and state
  return {
    // State
    promoters,
    branches,
    loading,
    totalRecords,
    filteredPromoters,
    // API Methods
    loadPromoters,
    loadBranches,
    createPromoter,
    updatePromoter,
    deletePromoter,
    getPromoter
  };
}
