import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string;
  gender: string;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: string;
  fitnessGoal: string;
  dietPreference: string;
  dailyCalorieGoal: number;
  dailyWaterGoal: number;
  dailySleepGoal: number;
  streak: number;
  totalWorkouts: number;
  totalCaloriesBurned: number;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingCompleted: boolean;
  selectedWorkout: any | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setSelectedWorkout: (workout: any | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  onboardingCompleted: localStorage.getItem('onboardingCompleted') === 'true',
  selectedWorkout: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ username, password });
      const user = data.data.user;
      const token = data.data.accessToken;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (formData: any) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register(formData);
      const user = data.data.user;
      const token = data.data.accessToken;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('onboardingCompleted', 'false');

      set({ user, isAuthenticated: true, isLoading: false, onboardingCompleted: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Silent fail
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('onboardingCompleted');
    set({ user: null, isAuthenticated: false, onboardingCompleted: false, selectedWorkout: null });
  },

  loadUser: async () => {
    try {
      const { data } = await authAPI.getMe();
      const user = data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (data: Partial<User>) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...data } : null;
      if (updatedUser) localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setOnboardingCompleted: (completed: boolean) => {
    localStorage.setItem('onboardingCompleted', completed ? 'true' : 'false');
    set({ onboardingCompleted: completed });
  },
  
  setSelectedWorkout: (workout: any | null) => set({ selectedWorkout: workout }),
}));

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light', // default to light

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    });
  },

  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));

// Sidebar Store
interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
  closeMobile: () => set({ isMobileOpen: false }),
}));
