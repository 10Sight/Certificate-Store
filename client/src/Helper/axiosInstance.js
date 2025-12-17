import axios from "axios";

const ENV_BASE = import.meta?.env?.VITE_API_BASE_URL;
const BASE_URL = "https://certificate-store-server.onrender.com";

const axiosInstance = axios.create({ baseURL: BASE_URL, withCredentials: true });

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Axios Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            console.warn('Unauthorized request - token may be invalid or expired');
        }

        if (error.response?.status === 404) {
            console.warn('API endpoint not found:', error.config?.url);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;