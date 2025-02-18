import { defineStore } from 'pinia';
import { getFromLocalStorage, saveToLocalStorage } from '@/utilities/localStorage';
import { useLoadingStore } from './loaderStore';
import apiClient from '../api/apiClient';
import router from '@/router/index.js';
import { extractToValues, extractRouteList, removeEmptyItems } from '@/utilities/treeHelpers.js';
import { handleError } from '@/utilities/errorHandler';
import {jwtDecode} from 'jwt-decode';

export const useMainStore = defineStore({
    id: 'main',
    state: () => ({
        isRTL: getFromLocalStorage('Rtl') ? getFromLocalStorage('Rtl') : false,
        language: getFromLocalStorage('Language') ? getFromLocalStorage('Language') : { name: 'English', code: 'en' }, // Default language
        loading: useLoadingStore(),
        error: '',
        pageTree: [],
        pathsList: ['/pages/notfound', '/auth/login', '/', '/auth/access'],
        routeList: [],
        userInfo: []
    }),
    getters: {
        accessAllowed: (state) => (path) => {
            // Check exact paths
            if (state.pathsList.includes(path)) {
                return true;
            }

            // Define regex patterns for GUID segments
            const guidPattern = '[0-9a-fA-F-]{36}';

            // Check dynamic paths by comparing the base paths using regex
            for (let route of state.pathsList) {
                // Create a regex pattern for the current route
                const dynamicPattern = new RegExp(`^${route}(\/${guidPattern})*(\/[^\/]+)*$`);

                if (dynamicPattern.test(path)) {
                    return true;
                }
            }

            return false;
        }
    },
    actions: {
        toggleRTL() {
            if (this.language.value === 'ar') {
                this.isRTL = true;
                saveToLocalStorage('Rtl', this.isRTL);
            } else {
                this.isRTL = false;
                saveToLocalStorage('Rtl', this.isRTL);
            }
        },
        hasBranchIdKey(token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken && Object.prototype.hasOwnProperty.call(decodedToken, 'BranchId')) {
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },
        changeLanguage(language) {
            this.language = language;
            saveToLocalStorage('Language', language);
        },
        async login(userPayload) {
            //this.loading.setLoading();
            // this.loading.setBarLoading();
            try {
                const response = await apiClient.post('/auth/login', userPayload);
                const token = response.data.token;

                this.userInfo = response.data;
       
                if (userPayload.rememberMe) {
                    saveToLocalStorage('token', token);
                    localStorage.setItem('rememberMe', userPayload.rememberMe);
                    saveToLocalStorage('refreshToken', response.data.refreshToken);
                } else {
                    sessionStorage.setItem('Token', token);
                    // localStorage.setItem('rememberMe', userPayload.rememberMe);
                    localStorage.setItem('rememberMe', false);
                }
                await this.getMenu();
                //this.loading.resetLoading();
                // this.loading.resetBarLoading();

                router.push({ name: 'available-branches' });
            } catch (err) {
                //this.loading.resetLoading();
                // this.loading.resetBarLoading();
                this.error = handleError(err, this.loading);
            }
        },
        async chooseBranch(userPayload) {
            try {
                const response = await apiClient.post('/UserBranches/ChooseBranchFromAvailableBranches', userPayload);
                const token = response.data.data;
                var rememberMe = localStorage.getItem('rememberMe');
                if (rememberMe == true) {
                    saveToLocalStorage('token', token);
                    localStorage.removeItem('refreshToken');
                } else {
                    sessionStorage.setItem('Token', token);
                }
                router.push({ name: 'userRoles' });
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
        logout() {
            const rememberMe = localStorage.getItem('rememberMe');
            if (rememberMe == true) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            } else {
                sessionStorage.removeItem('Token');
            }
            localStorage.removeItem('rememberMe');
            this.pathsList = ['/pages/notfound', '/auth/login', '/auth/access', '/'];
            this.pageTree = [];
            router.push({ name: 'login' });
        },
        async getMenu() {
            try {
                const response = await apiClient.get('/PageRoles/GetMenuItems');
                this.pageTree = removeEmptyItems(response.data.data.sidebarItems);
                // const toValues = extractToValues(response.data.data);
                // const routeList = extractRouteList(response.data.data);
                this.pathsList = this.pathsList.concat(response.data.data.navigableItems);
                this.routeList = response.data.data.searchItems;
            } catch (err) {
                console.log('Error occurred:', err);
                this.error = handleError(err, this.loading);
            }
        }
    }
});
