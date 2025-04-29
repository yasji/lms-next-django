import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Auth state and utility functions
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  errorType: 'email' | 'password' | 'account' | 'general' | null;
  isAuthenticated: boolean; // Add this property
  
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearErrors: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  errorType: null,
  // Add computed property for authentication status
  get isAuthenticated() {
    return get().user !== null;
  },

  clearErrors: () => {
    set({ error: null, errorType: null });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null, errorType: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      set({ 
        user: response.data.user,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to login';
      
      // Determine error type based on error message
      let errorType: 'email' | 'password' | 'account' | 'general' = 'general';
      
      if (errorMsg.includes("email does not exist")) {
        errorType = 'email';
      } else if (errorMsg.includes("Invalid password")) {
        errorType = 'password';
      } else if (errorMsg.includes("inactive")) {
        errorType = 'account';
      }
      
      set({ 
        error: errorMsg,
        errorType,
        isLoading: false 
      });
      throw new Error(errorMsg);
    }
  },
  
  register: async (username: string, email: string, password: string, role = 'reader') => {
    set({ isLoading: true, error: null, errorType: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        role
      });
      
      set({ 
        user: response.data.user,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to register';
      set({ 
        error: errorMsg,
        errorType: 'general',
        isLoading: false 
      });
      throw new Error(errorMsg);
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/auth/logout`);
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, isLoading: false }); // Still clear user data
    }
  },
  
  checkAuth: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`);
      
      if (response.data.authenticated && response.data.user) {
        set({ user: response.data.user, error: null });
        return true;
      } else {
        set({ user: null });
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null });
      return false;
    }
  }
}));

// Check if user is admin
export const isAdmin = () => {
  const user = useAuth.getState().user;
  return user?.role === 'admin';
};

// Check if user is reader
export const isReader = () => {
  const user = useAuth.getState().user;
  return user?.role === 'reader';
};

// Get current user
export const getCurrentUser = () => {
  return useAuth.getState().user;
};

export default useAuth;
