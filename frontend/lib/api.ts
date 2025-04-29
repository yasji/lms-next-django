// Enhance the API utilities with better error handling

import { useAuth } from './auth';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

// Type for API errors
export interface ApiError {
  error: string;
  message: string;
  detail?: string;
  status: number;
}

// Fetch wrapper with enhanced authentication handling
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  // Handle authentication and authorization errors
  if (response.status === 401) {
    // If unauthorized (not authenticated), trigger logout
    const { logout } = useAuth.getState();
    logout();
    
    // Create a structured error
    const error: ApiError = {
      error: 'authentication_required',
      message: 'Your session has expired. Please log in again.',
      status: 401
    };
    
    return Promise.reject(error);
  }
  
  // Handle authorization errors (forbidden)
  if (response.status === 403) {
    // Try to parse the error response
    try {
      const errorData = await response.json();
      const error: ApiError = {
        error: errorData.error || 'permission_denied',
        message: errorData.message || 'You do not have permission to access this resource.',
        detail: errorData.detail,
        status: 403
      };
      
      return Promise.reject(error);
    } catch (e) {
      // If parsing fails, return a generic error
      const error: ApiError = {
        error: 'permission_denied',
        message: 'You do not have permission to access this resource.',
        status: 403
      };
      
      return Promise.reject(error);
    }
  }

  return response;
};

// Helper to handle API errors in components
export const handleApiError = (error: unknown, toast: ReturnType<typeof useToast>['toast']) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as ApiError;
    
    toast({
      title: apiError.error === 'authentication_required' ? 'Authentication Required' : 'Access Denied',
      description: apiError.message || 'An error occurred while processing your request.',
      variant: 'destructive',
    });
    
    return;
  }
  
  // Handle unknown errors
  toast({
    title: 'Error',
    description: error instanceof Error ? error.message : 'An unexpected error occurred.',
    variant: 'destructive',
  });
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Create a configured axios instance for API calls
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API requests in development to help with debugging
api.interceptors.request.use(config => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params || {});
  }
  return config;
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login if there's an auth error
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        window.location.href = `/auth/login?returnUrl=${encodeURIComponent(currentPath)}`;
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic GET request
export const fetchApi = async <T>(endpoint: string, params = {}): Promise<T> => {
  const response = await api.get(endpoint, { params });
  return response.data;
};

// Generic POST request
export const postApi = async <T>(endpoint: string, data = {}): Promise<T> => {
  const response = await api.post(endpoint, data);
  return response.data;
};

// Generic PUT request
export const putApi = async <T>(endpoint: string, data = {}): Promise<T> => {
  const response = await api.put(endpoint, data);
  return response.data;
};

// Generic DELETE request
export const deleteApi = async <T>(endpoint: string): Promise<T> => {
  const response = await api.delete(endpoint);
  return response.data;
};

// Make sure we export api directly
export { api as default };
