import { defineStore } from 'pinia';
import apiClient from '@/api/apiClient';

export const useSalesGoalsStore = defineStore({
  id: 'salesGoals',
  state: () => ({
    salesGoals: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchSalesGoals() {
      this.loading = true;
      this.error = null;

      try {
        const response = await apiClient.post('/SalesGoals/GetSalesGoalsBasedOnBranch', {}, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.data) {
          this.salesGoals = response.data.data;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        this.error = err.message || 'Failed to fetch sales goals';
        console.error('Error fetching sales goals:', err);
      } finally {
        this.loading = false;
      }
    }
  }
});
