import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { 
  User, 
  Todo, 
  CreateTodoData, 
  UpdateTodoData, 
  LoginData, 
  RegisterData,
  AuthResponse,
  ApiResponse,
  PaginationData,
  UserStats,
  TodoStats
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed, clearing auth data');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return Promise.reject(refreshError);
      }
    }

    // Log other errors for debugging
    if (error.response?.status >= 400) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: originalRequest.url,
        method: originalRequest.method
      });
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/auth/me');
    return response.data;
  }
};

// Todo API
export const todoApi = {
  getAll: async (params?: {
    completed?: boolean;
    priority?: string;
    sortBy?: string;
    order?: string;
    search?: string;
    tags?: string;
  }): Promise<ApiResponse<Todo[]>> => {
    const response: AxiosResponse<ApiResponse<Todo[]>> = await api.get('/todos', { params });
    return response.data;
  },

  getPublic: async (params?: {
    limit?: number;
    sortBy?: string;
    order?: string;
  }): Promise<ApiResponse<Todo[]>> => {
    const response: AxiosResponse<ApiResponse<Todo[]>> = await api.get('/todos/public', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Todo>> => {
    const response: AxiosResponse<ApiResponse<Todo>> = await api.get(`/todos/${id}`);
    return response.data;
  },

  create: async (todoData: CreateTodoData): Promise<ApiResponse<Todo>> => {
    const response: AxiosResponse<ApiResponse<Todo>> = await api.post('/todos', todoData);
    return response.data;
  },

  update: async (id: string, todoData: UpdateTodoData): Promise<ApiResponse<Todo>> => {
    const response: AxiosResponse<ApiResponse<Todo>> = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/todos/${id}`);
    return response.data;
  },

  toggle: async (id: string): Promise<ApiResponse<Todo>> => {
    const response: AxiosResponse<ApiResponse<Todo>> = await api.patch(`/todos/${id}/toggle`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{
    summary: TodoStats;
    byPriority: Array<{ _id: string; count: number; completed: number }>;
    recent: Todo[];
  }>> => {
    const response: AxiosResponse<ApiResponse<{
      summary: TodoStats;
      byPriority: Array<{ _id: string; count: number; completed: number }>;
      recent: Todo[];
    }>> = await api.get('/todos/stats/summary');
    return response.data;
  }
};

// Admin API
export const adminApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    users: User[];
    pagination: PaginationData;
    stats: UserStats;
  }>> => {
    const response: AxiosResponse<ApiResponse<{
      users: User[];
      pagination: PaginationData;
      stats: UserStats;
    }>> = await api.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<{
    user: User;
    stats: {
      totalTodos: number;
      completedTodos: number;
      completionRate: string;
    };
  }>> => {
    const response: AxiosResponse<ApiResponse<{
      user: User;
      stats: {
        totalTodos: number;
        completedTodos: number;
        completionRate: string;
      };
    }>> = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  resetUserPassword: async (id: string, newPassword: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/admin/users/${id}/reset-password`, {
      newPassword
    });
    return response.data;
  },

  getUserPasswordStatus: async (id: string): Promise<ApiResponse<{
    hasPassword: boolean;
    lastPasswordChange: string;
    passwordStrength: string;
  }>> => {
    const response: AxiosResponse<ApiResponse<{
      hasPassword: boolean;
      lastPasswordChange: string;
      passwordStrength: string;
    }>> = await api.get(`/admin/users/${id}/password-status`);
    return response.data;
  },

  getDashboard: async (): Promise<ApiResponse<{
    userStats: UserStats;
    todoStats: TodoStats;
    recentUsers: User[];
    recentTodos: Todo[];
    usersByRole: Array<{ _id: string; count: number }>;
    todosByPriority: Array<{ _id: string; count: number }>;
  }>> => {
    const response: AxiosResponse<ApiResponse<{
      userStats: UserStats;
      todoStats: TodoStats;
      recentUsers: User[];
      recentTodos: Todo[];
      usersByRole: Array<{ _id: string; count: number }>;
      todosByPriority: Array<{ _id: string; count: number }>;
    }>> = await api.get('/admin/dashboard');
    return response.data;
  }
};

// User API
export const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response: AxiosResponse<ApiResponse<User[]>> = await api.get('/users');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default api; 