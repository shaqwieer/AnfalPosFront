import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export const useCityStore = defineStore({
    id: 'city',
    state: () => ({
        cities: [],
        loading: useLoadingStore(),
        error: ''
    }),
    actions: {
        async getCities() {
            try {
                const response = await apiClient.get('/Cities');
                this.cities = response.data.data;               
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
        async getCountries() {
            try {
                const response = await apiClient.get('/Countries');
                return response.data.data;
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
        async createCity(payload) {
            try {
                const response = await apiClient.post('/Cities', payload);
                response.data.data.countryId = payload.countryId;
                response.data.data.countryName = payload.countryName;
                this.cities.push(response.data.data);
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                this.error = handleError(err, this.loading);

            }
        },
        async deleteCity(cityId) {
            try {
                const response = await apiClient.delete(`/Cities/${cityId}`);
                const index = this.cities.findIndex((city) => city.id === cityId);
                this.cities.splice(index, 1);
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                this.error = handleError(err, this.loading);

            }
        },

        async updateCity(cityId, payload) {
            try {
                const response = await apiClient.put(`/Cities/${cityId}`, payload);
                const index = this.cities.findIndex((city) => city.id === cityId);
                response.data.data.countryId = payload.countryId;
                response.data.data.countryName = payload.countryName;
                this.cities[index] = { ...this.cities[index], ...response.data.data };
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        }
    }
});