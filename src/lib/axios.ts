import axios from 'axios';
import { store } from '@/store/store';
import { refreshTokenSuccess, logout } from '@/store/features/authSlice';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach accessToken to every request
api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// State variables for concurrent token refresh handling
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void, reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor: Handle token expiration (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and it's not a retry or a refresh request itself
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
            if (isRefreshing) {
                // If a refresh is already in progress, queue this request until it's done
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = store.getState().auth.refreshToken;
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call the refresh token endpoint using axios directly to bypass interceptors
                const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Update Redux state and localStorage
                store.dispatch(refreshTokenSuccess({ accessToken, refreshToken: newRefreshToken }));

                // Resolve all paused requests with the new token
                processQueue(null, accessToken);

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, reject all queued requests
                processQueue(refreshError, null);
                
                // Log out the user and redirect to login
                store.dispatch(logout());
                const path = window.location.pathname;
                if (typeof window !== 'undefined' && !['/login', '/register', '/forgot-password'].includes(path)) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                // Free the lock
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
