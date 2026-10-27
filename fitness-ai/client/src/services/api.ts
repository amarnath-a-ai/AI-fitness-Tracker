import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token from localStorage as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
  sendOTP: (data: any) => api.post('/auth/send-otp', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getProgress: (days?: number) => api.get(`/progress?days=${days || 30}`),
};

// Food API
export const foodAPI = {
  getFoods: (params?: any) => api.get('/foods', { params }),
  getFood: (id: string) => api.get(`/foods/${id}`),
  createFood: (data: any) => api.post('/foods', data),
  updateFood: (id: string, data: any) => api.put(`/foods/${id}`, data),
  deleteFood: (id: string) => api.delete(`/foods/${id}`),
  logMeal: (data: any) => api.post('/foods/meals/log', data),
  getMealLogs: (params?: any) => api.get('/foods/meals/logs', { params }),
  getDailyNutrition: (date?: string) => api.get('/foods/meals/daily', { params: { date } }),
  deleteMealLog: (id: string) => api.delete(`/foods/meals/${id}`),
};

// Workout API
export const workoutAPI = {
  getExercises: (params?: any) => api.get('/workouts/exercises', { params }),
  getExercise: (id: string) => api.get(`/workouts/exercises/${id}`),
  logWorkout: (data: any) => api.post('/workouts/log', data),
  getWorkoutLogs: (params?: any) => api.get('/workouts/logs', { params }),
  getWorkoutSummary: (days?: number) => api.get(`/workouts/summary?days=${days || 7}`),
  deleteWorkoutLog: (id: string) => api.delete(`/workouts/logs/${id}`),
};

// Tracker API
export const trackerAPI = {
  // Water
  addWater: (data: any) => api.post('/tracker/water', data),
  getWaterLogs: (params?: any) => api.get('/tracker/water', { params }),
  getDailyWater: (date?: string) => api.get('/tracker/water/daily', { params: { date } }),
  deleteWaterLog: (id: string) => api.delete(`/tracker/water/${id}`),
  // Sleep
  addSleep: (data: any) => api.post('/tracker/sleep', data),
  getSleepLogs: (params?: any) => api.get('/tracker/sleep', { params }),
  deleteSleepLog: (id: string) => api.delete(`/tracker/sleep/${id}`),
  // Weight
  addWeight: (data: any) => api.post('/tracker/weight', data),
  getWeightLogs: (params?: any) => api.get('/tracker/weight', { params }),
  deleteWeightLog: (id: string) => api.delete(`/tracker/weight/${id}`),
  // Goals
  createGoal: (data: any) => api.post('/tracker/goals', data),
  getGoals: (params?: any) => api.get('/tracker/goals', { params }),
  updateGoal: (id: string, data: any) => api.put(`/tracker/goals/${id}`, data),
  deleteGoal: (id: string) => api.delete(`/tracker/goals/${id}`),
};

// AI API
export const aiAPI = {
  getMealPlan: (data: any) => api.post('/ai/meal-plan', data),
  getWorkoutPlan: (data: any) => api.post('/ai/workout-plan', data),
  chat: (data: any) => api.post('/ai/chat', data),
};

export const healthAPI = {
  predictBMI: (data: any) => api.post('/health/predict/bmi', data),
  predictSleep: (data: any) => api.post('/health/predict/sleep', data),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getBlogs: () => api.get('/admin/blogs'),
  createBlog: (data: any) => api.post('/admin/blogs', data),
  updateBlog: (id: string, data: any) => api.put(`/admin/blogs/${id}`, data),
  deleteBlog: (id: string) => api.delete(`/admin/blogs/${id}`),
};

export default api;
