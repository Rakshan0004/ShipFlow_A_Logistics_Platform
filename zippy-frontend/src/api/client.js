// Axios API Client with Interceptors

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    // e.g., auth tokens when implemented
    // config.headers.Authorization = `Bearer ${token}`;
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Handle errors globally
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const statusCode = error.response?.status;
    
    console.error('[API Response Error]', {
      status: statusCode,
      message: errorMessage,
      url: error.config?.url
    });
    
    // Create a standardized error object
    const standardError = {
      message: errorMessage,
      status: statusCode,
      data: error.response?.data
    };
    
    // Handle specific status codes
    if (statusCode === 401) {
      // Unauthorized - could redirect to login in future
      standardError.message = 'Unauthorized access';
    } else if (statusCode === 403) {
      standardError.message = 'Access forbidden';
    } else if (statusCode === 404) {
      standardError.message = 'Resource not found';
    } else if (statusCode === 500) {
      standardError.message = 'Server error occurred';
    } else if (error.code === 'ECONNABORTED') {
      standardError.message = 'Request timeout';
    } else if (error.code === 'ERR_NETWORK') {
      standardError.message = 'Network error - please check your connection';
    }
    
    return Promise.reject(standardError);
  }
);

export default apiClient;
