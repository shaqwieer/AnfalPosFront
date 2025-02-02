import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export const useCustomerStore = defineStore({
    id: 'customerStore',
    state: () => ({
        customers: [],
        loading: useLoadingStore(),
        error: '',
    }),
    actions: {
        async GetCustomerBasedOnBranchType() {
            try {
                const response = await apiClient.get('/Customers/GetCustomerBasedOnBranchType');
                this.customers = response.data.data;
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        }

    }
});
