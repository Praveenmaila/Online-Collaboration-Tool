import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';

export interface Project {
  _id: string;
  name: string;
  description: string;
  key: string;
  status: 'active' | 'completed' | 'archived';
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  _id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: 'planning' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface UserStory {
  _id: string;
  title: string;
  description: string;
  projectId: string;
  sprintId?: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  points: number;
  assignee?: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  sprints: Sprint[];
  currentSprint: Sprint | null;
  userStories: UserStory[];
  isLoading: boolean;
  error: string | null;
  
  // Project methods
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Sprint methods
  fetchSprints: (projectId: string) => Promise<void>;
  fetchSprintById: (projectId: string, sprintId: string) => Promise<void>;
  createSprint: (sprint: Partial<Sprint>) => Promise<void>;
  updateSprint: (sprintId: string, sprint: Partial<Sprint>) => Promise<void>;
  deleteSprint: (sprintId: string) => Promise<void>;
  
  // User story methods
  fetchUserStories: (projectId: string, sprintId?: string) => Promise<void>;
  createUserStory: (userStory: Partial<UserStory>) => Promise<void>;
  updateUserStory: (storyId: string, userStory: Partial<UserStory>) => Promise<void>;
  deleteUserStory: (storyId: string) => Promise<void>;
  
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  sprints: [],
  currentSprint: null,
  userStories: [],
  isLoading: false,
  error: null,
  
  // Project methods
  fetchProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/projects`);
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch projects.', 
        isLoading: false 
      });
    }
  },
  
  fetchProjectById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/projects/${id}`);
      set({ currentProject: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch project.', 
        isLoading: false 
      });
    }
  },
  
  createProject: async (project) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/projects`, project);
      const newProject = response.data;
      set((state) => ({ 
        projects: [...state.projects, newProject],
        currentProject: newProject, 
        isLoading: false 
      }));
      return Promise.resolve();
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create project.', 
        isLoading: false 
      });
      return Promise.reject(error);
    }
  },
  
  updateProject: async (id, project) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`${API_URL}/projects/${id}`, project);
      const updatedProject = response.data;
      
      set((state) => ({ 
        projects: state.projects.map(p => p._id === id ? updatedProject : p),
        currentProject: updatedProject,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update project.', 
        isLoading: false 
      });
    }
  },
  
  deleteProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`${API_URL}/projects/${id}`);
      
      set((state) => ({ 
        projects: state.projects.filter(p => p._id !== id),
        currentProject: state.currentProject?._id === id ? null : state.currentProject,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete project.', 
        isLoading: false 
      });
    }
  },
  
  // Sprint methods
  fetchSprints: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/projects/${projectId}/sprints`);
      set({ sprints: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch sprints.', 
        isLoading: false 
      });
    }
  },
  
  fetchSprintById: async (projectId, sprintId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/projects/${projectId}/sprints/${sprintId}`);
      set({ currentSprint: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch sprint.', 
        isLoading: false 
      });
    }
  },
  
  createSprint: async (sprint) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/projects/${sprint.projectId}/sprints`, sprint);
      set((state) => ({ 
        sprints: [...state.sprints, response.data],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create sprint.', 
        isLoading: false 
      });
    }
  },
  
  updateSprint: async (sprintId, sprint) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`${API_URL}/sprints/${sprintId}`, sprint);
      
      set((state) => ({ 
        sprints: state.sprints.map(s => s._id === sprintId ? response.data : s),
        currentSprint: state.currentSprint?._id === sprintId ? response.data : state.currentSprint,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update sprint.', 
        isLoading: false 
      });
    }
  },
  
  deleteSprint: async (sprintId) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`${API_URL}/sprints/${sprintId}`);
      
      set((state) => ({ 
        sprints: state.sprints.filter(s => s._id !== sprintId),
        currentSprint: state.currentSprint?._id === sprintId ? null : state.currentSprint,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete sprint.', 
        isLoading: false 
      });
    }
  },
  
  // User story methods
  fetchUserStories: async (projectId, sprintId) => {
    try {
      set({ isLoading: true, error: null });
      let url = `${API_URL}/projects/${projectId}/stories`;
      if (sprintId) {
        url = `${API_URL}/projects/${projectId}/sprints/${sprintId}/stories`;
      }
      
      const response = await axios.get(url);
      set({ userStories: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch user stories.', 
        isLoading: false 
      });
    }
  },
  
  createUserStory: async (userStory) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/projects/${userStory.projectId}/stories`, userStory);
      
      set((state) => ({ 
        userStories: [...state.userStories, response.data],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create user story.', 
        isLoading: false 
      });
    }
  },
  
  updateUserStory: async (storyId, userStory) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`${API_URL}/stories/${storyId}`, userStory);
      
      set((state) => ({ 
        userStories: state.userStories.map(s => s._id === storyId ? response.data : s),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update user story.', 
        isLoading: false 
      });
    }
  },
  
  deleteUserStory: async (storyId) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`${API_URL}/stories/${storyId}`);
      
      set((state) => ({ 
        userStories: state.userStories.filter(s => s._id !== storyId),
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete user story.', 
        isLoading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));