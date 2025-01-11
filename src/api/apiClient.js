// src/api/apiClient.js
import axios from 'axios';
import router from '@/router/index';
import { getFromLocalStorage } from '@/utilities/localStorage.js';
import { useMainStore } from '../stores/mainStore';
// import { useAuthStore } from '../stores/AuthStore';
// build
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API, 
    headers: {
        Accept: 'application/json'
        // 'Content-Type': 'application/json'
    }
});
const handleHttpResponseOrError = (status, data) => {
    const mainStore = useMainStore();
    // const authStore = useAuthStore();
    console.log(status, data);
    switch (status) {
        case 200:

            break;

        case 400:
            console.error('Bad Request:');
            break;

        case 401:
            if(getFromLocalStorage('rememberMe')==false){
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

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // const authStore = useAuthStore();
        const token = getFromLocalStorage('token')|| sessionStorage.getItem('Token');
        const preferredLanguage = getFromLocalStorage("Language")?{name:getFromLocalStorage("Language").name,value:getFromLocalStorage("Language").value} :{name:'English',value:'en'};
        config.headers['Accept-Language'] = preferredLanguage.value;
        console.log('axios interceptor go to server');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Function to refresh the token
const refreshAuthToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const jwtToken = localStorage.getItem('token');
        const response = await axios.post(`${import.meta.env.VITE_API}/Auth/refresh-token`, { accessToken: jwtToken,refreshToken:refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        return accessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.push({ name: 'login' });
        return null;
    }
};
// Response interceptor to handle responses and errors
apiClient.interceptors.response.use(
    (response) => {
        handleHttpResponseOrError(response.status, response.data);
        return response;
    },
    async (error) => {
        const { response } = error;
        if (response) {
            let token =getFromLocalStorage('token');
            let rememberMe = getFromLocalStorage('rememberMe');
            if (response.status === 401 && !error.config._retry&&token&&rememberMe) {
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
