import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Login failed. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Registration failed. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ isAuthenticated: false, user: null });
  },
  
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token validity
      const response = await axios.get(`${API_URL}/auth/me`);
      set({ isAuthenticated: true, user: response.data, isLoading: false });
    } catch (error) {
      // If token is invalid, clear it
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
  
  updateProfile: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`${API_URL}/users/profile`, userData);
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Profile update failed.', 
        isLoading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));