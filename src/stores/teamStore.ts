import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  skills?: string[];
  projects?: string[];
}

interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  
  fetchMembers: () => Promise<void>;
  fetchMemberById: (id: string) => Promise<TeamMember>;
  inviteMember: (email: string, role: 'admin' | 'member') => Promise<void>;
  updateMember: (id: string, data: Partial<TeamMember>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,
  
  fetchMembers: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/team`);
      set({ members: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch team members.',
        isLoading: false 
      });
    }
  },
  
  fetchMemberById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/team/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch team member.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  inviteMember: async (email, role) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/team/invite`, { email, role });
      set((state) => ({ 
        members: [...state.members, response.data],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to invite team member.',
        isLoading: false 
      });
    }
  },
  
  updateMember: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`${API_URL}/team/${id}`, data);
      
      set((state) => ({ 
        members: state.members.map(m => m._id === id ? { ...m, ...response.data } : m),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update team member.',
        isLoading: false 
      });
    }
  },
  
  removeMember: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`${API_URL}/team/${id}`);
      
      set((state) => ({ 
        members: state.members.filter(m => m._id !== id),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to remove team member.',
        isLoading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));