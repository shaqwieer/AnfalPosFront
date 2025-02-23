import { defineStore } from 'pinia';
import apiClient from '@/api/apiClient';

export const useSalesGoalsStore = defineStore({
  id: 'salesGoals',
  state: () => ({
    salesGoals: [],
    salesReps: [],
    loading: false,
    error: null,
    creditLimit: 0,
    availableCredit: 0,
    currentBalance: 0
  }),
  actions: {
    async fetchSalesGoals(payload) {
      this.loading = true;
      this.error = null;

      try {
        const response = await apiClient.post('/SalesGoals/GetSalesRepGoals', payload, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.data) {
          let data = response.data.data;
          this.salesGoals = data.salesGoals;
          this.creditLimit = data.creditLimit;
          this.availableCredit = data.availableCredit;
          this.currentBalance = data.currentBalance;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        this.error = err.message || 'Failed to fetch sales goals';
        console.error('Error fetching sales goals:', err);
      } finally {
        this.loading = false;
      }
    },
    async GetSalesReps() {
      try {
        const response = await apiClient.get('/BusinessEntities/GetUserVanSaleInBranch');
        this.salesReps = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async GetSalesRepsForOrganization() {
      try {
        const response = await apiClient.get('/BusinessEntities/GetUserInOrganization');
        this.salesReps = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    }
  }
});
