import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export const useOrganizationStore = defineStore({
    id: 'organization',
    state: () => ({
        lookups: [],
        branchLookups:[],
        loading: useLoadingStore(),
        error: ''
    }),
    actions: {
        async getOrganizationLookups() {
            try {
                const response = await apiClient.get('/Organizations/GetOrganizationLookups');
                this.lookups = response.data.data;
                return response.data.data;    

            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
        async getBranchLookups() {
            try {
                const response = await apiClient.get('/Branches/GetBranchLookups');
                this.branchLookups = response.data.data;
                return response.data.data;    

            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
    }
});