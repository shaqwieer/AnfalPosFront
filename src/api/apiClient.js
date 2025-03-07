import axios from 'axios';
import router from '@/router/index';
import { getFromLocalStorage } from '@/utilities/localStorage.js';
import { useMainStore } from '../stores/mainStore';
import { getActivePinia } from 'pinia';
import { useLoaderDataStore } from '../stores/loader';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API,
    headers: {
        Accept: 'application/json',
    },
});

const handleHttpResponseOrError = (status, data) => {
    const pinia = getActivePinia();
    if (!pinia) return;

    const mainStore = useMainStore(pinia);

    switch (status) {
        case 200:
            break;
        case 400:
            console.error('Bad Request:', data);
            break;
        case 401:
            if (getFromLocalStorage('rememberMe') === false) {
                mainStore.logout();
            }
            break;
        case 403:
            console.error('Forbidden:', data);
            router.push('/');
            break;
        case 404:
            console.error('Not Found:', data);
            break;
        case 500:
            console.error('Internal Server Error:', data);
            break;
        default:
            console.error('HTTP response or error:', status, data);
            break;
    }
};

apiClient.interceptors.request.use(
    (config) => {
        const pinia = getActivePinia();
        if (pinia) {
            const loaderStore = useLoaderDataStore(pinia);
            loaderStore.showLoader();
        }

        const token = getFromLocalStorage('token') || sessionStorage.getItem('Token');
        const preferredLanguage = getFromLocalStorage('Language')
            ? {
                  name: getFromLocalStorage('Language').name,
                  value: getFromLocalStorage('Language').value,
              }
            : { name: 'English', value: 'en' };

        config.headers['Accept-Language'] = preferredLanguage.value;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        const pinia = getActivePinia();
        if (pinia) {
            const loaderStore = useLoaderDataStore(pinia);
            loaderStore.hideLoader();
        }
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        const pinia = getActivePinia();
        if (pinia) {
            const loaderStore = useLoaderDataStore(pinia);
            loaderStore.hideLoader();
        }
        handleHttpResponseOrError(response.status, response.data);
        return response;
    },
    async (error) => {
        const pinia = getActivePinia();
        if (pinia) {
            const loaderStore = useLoaderDataStore(pinia);
            loaderStore.hideLoader();
        }

        const { response } = error;

        if (response) {
            const token = getFromLocalStorage('token');
            const rememberMe = getFromLocalStorage('rememberMe');

            if (response.status === 401 && !error.config._retry && token && rememberMe) {
                error.config._retry = true;

                const newToken = await refreshAuthToken();
                if (newToken) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    return apiClient(error.config);
                }
            }

            handleHttpResponseOrError(response.status, response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up the request:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

async function refreshAuthToken() {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API}/auth/refresh-token`, {
            token: getFromLocalStorage('refreshToken'),
        });

        const { token } = response.data;
        if (token) {
            localStorage.setItem('token', token);
            return token;
        }
        return null;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
    }
}
