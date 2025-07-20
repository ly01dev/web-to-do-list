import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      console.log('=== AUTH CHECK START ===');
      console.log('Auth check - token:', token ? 'exists' : 'missing');
      console.log('Auth check - savedUser:', savedUser ? 'exists' : 'missing');
      console.log('Auth check - token value:', token);
      console.log('Auth check - user value:', savedUser);

      if (token && savedUser) {
        try {
          console.log('Attempting to get current user...');
          const response = await authApi.getCurrentUser();
          console.log('Get current user response:', response);
          if (response.success && response.data) {
            console.log('Setting user from auth check:', response.data);
            setUser(response.data);
          } else {
            console.log('Auth check failed - clearing storage');
            clearAuthData();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          clearAuthData();
        }
      } else {
        console.log('No token or user found, staying logged out');
      }
      setLoading(false);
      console.log('=== AUTH CHECK END ===');
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const response = await authApi.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        console.log('Login successful, setting user:', response.data.user);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        toast.success('Đăng nhập thành công!');
      } else {
        console.log('Login failed - no success or data');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Đăng nhập thất bại';
      toast.error(message);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await authApi.register({ username, email, password, firstName, lastName });
      
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        toast.success('Đăng ký thành công!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Đăng ký thất bại';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      toast.success('Đã đăng xuất');
    }
  };

  // const forceLogout = () => {
  //   clearAuthData();
  //   toast.success('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
  // };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 