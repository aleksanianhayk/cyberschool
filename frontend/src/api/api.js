// /frontend/src/api/api.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
});

// This is an interceptor. It runs before every request is sent.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('cyberstorm_token');
        if (token) {
            // If a token exists, add it to the Authorization header
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
