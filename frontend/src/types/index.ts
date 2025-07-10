export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  isPublic: boolean;
  startDate?: string;
  dueDate?: string;
  user: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  isPublic: boolean;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  isPublic?: boolean;
  startDate?: string;
  dueDate?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
}

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
} 