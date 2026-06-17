import axios from 'axios';
import { store } from '../store/store';
import { clearCredentials } from '../store/slices';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Retrieve token dynamically from Redux store
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error extraction & automatic 401 logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration or invalid tokens (401 Unauthorized)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url.includes('/auth/login') || 
                             originalRequest.url.includes('/auth/register') ||
                             originalRequest.url.includes('/auth/verify-otp') ||
                             originalRequest.url.includes('/auth/resend-otp');
      
      if (!isAuthEndpoint) {
        // Clear local credentials and force redirect to login
        store.dispatch(clearCredentials());
        window.location.href = '/login';
      }
    }
    
    // Extract standard error message from Express backend response
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Network connection failed';
                         
    const parsedError = new Error(errorMessage);
    parsedError.status = error.response?.status;
    parsedError.data = error.response?.data;
    
    return Promise.reject(parsedError);
  }
);

export default api;
