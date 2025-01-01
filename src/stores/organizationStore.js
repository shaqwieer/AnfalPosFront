import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export const useOrganizationStore = defineStore({
    id: 'organization',
    state: () => ({
        lookups: [],
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
    }
});