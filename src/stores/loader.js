// stores/loader.js
import { defineStore } from 'pinia';

export const useLoaderDataStore = defineStore('loader', {
    state: () => ({
        isDataLoading: false,
    }),
    actions: {
        showLoader() {
            console.log('Loader status before:', this.isDataLoading);
            this.isDataLoading = true;
            console.log('Loader status after:', this.isDataLoading);
        },
        hideLoader() {
            this.isDataLoading = false;
        },
    },
});
